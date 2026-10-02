import type { ImportDeclaration, ImportDeclarationSpecifier, Node, Program } from "oxc-parser"

export interface Import {
    declaration: ImportDeclaration
    /** Whether the namespace is used as a type, eg. `let x: Foo`. */
    isUsedAsType: boolean
    /** Whether the namespace itself is used, eg. `const x = Foo`, `Foo["bar"]` or `Foo.bar = 1`. */
    isUsedBare: boolean
    /** The `Foo.bar` nodes, by property name. */
    members: Map<string, Node[]>
    specifier: ImportDeclarationSpecifier
}

interface Scope {
    /** Whether `var` declarations end up in this scope. */
    isFunction: boolean
    /** The imports that are shadowed in this scope. */
    names?: Set<string>
    parent: Scope | undefined
}

interface Reference {
    kind: "bare" | "member" | "type"
    name: string
    node: Node
    property?: string
    scope: Scope
}

/** TypeScript nodes containing code that exists at runtime, all other `TS*` nodes are types. */
const runtimeNodes = new Set([
    "TSAsExpression",
    "TSEnumBody",
    "TSEnumDeclaration",
    "TSEnumMember",
    "TSExportAssignment",
    "TSInstantiationExpression",
    "TSModuleBlock",
    "TSModuleDeclaration",
    "TSNonNullExpression",
    "TSParameterProperty",
    "TSSatisfiesExpression",
    "TSTypeAssertion",
])

const functionNodes = new Set([
    "ArrowFunctionExpression",
    "FunctionDeclaration",
    "FunctionExpression",
])

const blockNodes = new Set([
    "BlockStatement",
    "CatchClause",
    "ClassExpression",
    "ForInStatement",
    "ForOfStatement",
    "ForStatement",
    "StaticBlock",
    "SwitchStatement",
    "TSModuleDeclaration",
])

/** Declarations are named in the enclosing scope, `FunctionExpression` and `ClassExpression` in their own. */
const declarationNodes = new Set([
    "ClassDeclaration",
    "FunctionDeclaration",
    "TSEnumDeclaration",
    "TSModuleDeclaration",
])

/** The keys that hold bindings instead of references. */
const bindingKeys = new Set(["id", "param", "params"])

/**
 * Collects the value imports of a module and how each of them is used.
 * `identifiers` receives the name of every identifier in the module.
 */
export function analyze(program: Program, identifiers: Set<string>): Map<string, Import> {
    const imports = new Map<string, Import>()

    for (const node of program.body) {
        if (node.type !== "ImportDeclaration") continue
        for (const specifier of node.specifiers) {
            identifiers.add(specifier.local.name)
            if (specifier.type === "ImportSpecifier" && specifier.imported.type === "Identifier") identifiers.add(specifier.imported.name)
            if (node.importKind === "type") continue
            if (specifier.type === "ImportSpecifier" && specifier.importKind === "type") continue
            imports.set(specifier.local.name, {
                declaration: node,
                isUsedAsType: false,
                isUsedBare: false,
                members: new Map(),
                specifier,
            })
        }
    }

    if (!imports.size) return imports

    // References are resolved after the walk, declarations might be hoisted.
    const references: Reference[] = []
    const root: Scope = { isFunction: true, parent: undefined }
    let scope = root
    // The nodes that are assigned to, eg. `Foo.bar` in `Foo.bar = 1`.
    const targets = new Set<Node>()
    let typeDepth = 0

    function refer(name: string, node: Node, property?: string): void {
        if (!imports.has(name)) return
        const kind = typeDepth ? "type" : property === undefined || targets.has(node) ? "bare" : "member"
        references.push({ kind, name, node, property, scope })
    }

    function declare(name: string, target: Scope): void {
        identifiers.add(name)
        // Imports can not be redeclared at the top level.
        if (target !== root && imports.has(name)) (target.names ??= new Set()).add(name)
    }

    function declarePattern(node: Node | null, target: Scope): void {
        if (!node) return
        switch (node.type) {
            case "ArrayPattern":
                for (const element of node.elements) declarePattern(element, target)
                return visit(node.typeAnnotation, node, "typeAnnotation")
            case "AssignmentPattern":
                declarePattern(node.left, target)
                return visit(node.right, node, "right")
            case "Identifier":
                declare(node.name, target)
                return visitChildren(node)
            case "ObjectPattern":
                for (const property of node.properties) declarePattern(property, target)
                return visit(node.typeAnnotation, node, "typeAnnotation")
            case "Property":
                visit(node.key, node, "key")
                return declarePattern(node.value, target)
            case "RestElement":
                declarePattern(node.argument, target)
                return visit(node.typeAnnotation, node, "typeAnnotation")
            case "TSParameterProperty":
                return declarePattern(node.parameter, target)
            default:
                return visit(node, null, "")
        }
    }

    function visitChildren(node: Node, skip?: Set<string>): void {
        for (const key in node) {
            if (skip?.has(key)) continue
            const value = (node as any)[key]
            if (!value || typeof value !== "object") continue
            if (Array.isArray(value)) {
                for (const child of value) visit(child, node, key)
            }
            else {
                visit(value, node, key)
            }
        }
    }

    function visitTypes(node: Node): void {
        typeDepth++
        visitChildren(node)
        typeDepth--
    }

    function assign(node: Node | null): void {
        switch (node?.type) {
            case "ArrayPattern":
                return node.elements.forEach(assign)
            case "AssignmentPattern":
                return assign(node.left)
            case "MemberExpression":
                return void targets.add(node)
            case "ObjectPattern":
                return node.properties.forEach(assign)
            case "ParenthesizedExpression":
            case "TSAsExpression":
            case "TSNonNullExpression":
            case "TSSatisfiesExpression":
                return assign(node.expression)
            case "Property":
                return assign(node.value)
            case "RestElement":
                return assign(node.argument)
        }
    }

    function visit(node: Node | null | undefined, parent: Node | null, key: string): void {
        if (!node || typeof node.type !== "string") return
        const type = node.type

        switch (node.type) {
            case "Identifier":
                identifiers.add(node.name)
                if (isReference(parent, key)) refer(node.name, node)
                return visitChildren(node)

            case "JSXIdentifier":
                if (isJSXReference(node.name, parent, key)) refer(node.name, node)
                return

            case "JSXMemberExpression":
            case "MemberExpression": {
                const { object, property } = node
                const isNamespace = (object.type === "Identifier" || object.type === "JSXIdentifier") && imports.has(object.name)
                const isStatic = property.type === "JSXIdentifier" || (property.type === "Identifier" && !(node as { computed?: boolean }).computed)
                if (!isNamespace || !isStatic) return visitChildren(node)
                if (object.type === "Identifier") identifiers.add(object.name)
                if (property.type === "Identifier") identifiers.add(property.name)
                return refer(object.name, node, property.name)
            }

            case "ExportAllDeclaration":
            case "ImportDeclaration":
                return

            case "ExportNamedDeclaration":
            case "ExportSpecifier":
                // export { foo } from "foo"
                if (node.type === "ExportNamedDeclaration" && node.source) return
                if (node.exportKind === "type") return visitTypes(node)
                return visitChildren(node)

            case "AssignmentExpression":
                assign(node.left)
                return visitChildren(node)

            case "UnaryExpression":
            case "UpdateExpression":
                if (node.type === "UpdateExpression" || node.operator === "delete") assign(node.argument)
                return visitChildren(node)

            case "VariableDeclaration": {
                const target = node.kind === "var" ? functionScope(scope) : scope
                for (const declarator of node.declarations) {
                    declarePattern(declarator.id, target)
                    visit(declarator.init, declarator, "init")
                }
                return
            }

            case "TSImportEqualsDeclaration": {
                // import foo = Foo.bar
                declare(node.id.name, scope)
                const previous = typeDepth
                typeDepth = 0
                visitChildren(node.moduleReference)
                if (node.moduleReference.type === "Identifier") refer(node.moduleReference.name, node.moduleReference)
                typeDepth = previous
                return
            }
        }

        if (type.startsWith("TS") && !runtimeNodes.has(type)) {
            return visitTypes(node)
        }

        const named = node as { id?: Node | null }
        const previous = scope

        if (declarationNodes.has(type) && named.id?.type === "Identifier") declare(named.id.name, scope)

        if (functionNodes.has(type) || blockNodes.has(type)) {
            scope = { isFunction: functionNodes.has(type) || type === "StaticBlock" || type === "TSModuleDeclaration", parent: scope }
        }

        if ((type === "FunctionExpression" || type === "ClassExpression") && named.id?.type === "Identifier") declare(named.id.name, scope)

        // for (Foo.bar of baz)
        if (node.type === "ForInStatement" || node.type === "ForOfStatement") assign(node.left)

        if (functionNodes.has(type) || declarationNodes.has(type) || type === "ClassExpression" || type === "CatchClause") {
            const { param, params } = node as { param?: Node | null, params?: Node[] }
            if (functionNodes.has(type)) {
                for (const param of params!) declarePattern(param, scope)
            }
            if (type === "CatchClause") declarePattern(param!, scope)
            visitChildren(node, bindingKeys)
        }
        else {
            visitChildren(node)
        }

        scope = previous
    }

    visit(program as unknown as Node, null, "")

    for (const { kind, name, node, property, scope } of references) {
        if (isShadowed(name, scope)) continue
        const data = imports.get(name)!
        if (kind === "type") {
            data.isUsedAsType = true
        }
        else if (kind === "bare") {
            data.isUsedBare = true
        }
        else {
            const members = data.members.get(property!)
            if (members) members.push(node)
            else data.members.set(property!, [node])
        }
    }

    return imports
}

function functionScope(scope: Scope): Scope {
    while (scope.parent && !scope.isFunction) scope = scope.parent
    return scope
}

function isShadowed(name: string, scope: Scope | undefined): boolean {
    while (scope) {
        if (scope.names?.has(name)) return true
        scope = scope.parent
    }
    return false
}

/** Whether an identifier in the given position refers to a binding, instead of naming a property or label. */
function isReference(parent: Node | null, key: string): boolean {
    switch (parent?.type) {
        case "AccessorProperty":
        case "MethodDefinition":
        case "Property":
        case "PropertyDefinition":
            return key !== "key" || parent.computed
        case "BreakStatement":
        case "ContinueStatement":
        case "LabeledStatement":
            return key !== "label"
        case "ExportSpecifier":
            return key === "local"
        case "ImportAttribute":
            return key !== "key"
        case "MemberExpression":
            return key === "object" || parent.computed
        case "MetaProperty":
            return false
        case "TSEnumMember":
            return key !== "id" || parent.computed
        default:
            return true
    }
}

function isJSXReference(name: string, parent: Node | null, key: string): boolean {
    // <Foo.Bar />
    if (parent?.type === "JSXMemberExpression") return key === "object"
    // <Foo />, but not <div />
    if (parent?.type === "JSXOpeningElement" || parent?.type === "JSXClosingElement") return !/^[a-z]/.test(name)
    return false
}
