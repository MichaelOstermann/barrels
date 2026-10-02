import type { ImportDeclaration, ImportDeclarationSpecifier, Node } from "oxc-parser"
import { readFile } from "node:fs/promises"
import { parseSync } from "oxc-parser"
import { importPath, resolveRelative } from "./files"

export interface Embed {
    /** The source of every type and interface declared in the file. */
    contents: string[]
    /** The imports those declarations depend on, relative to the barrel. */
    imports: { code: string, name: string }[]
    /** The names of the embedded declarations. */
    names: Set<string>
}

/**
 * A declaration barrel can not import a type that has the same name as the namespace it declares,
 * so the types of such a file are copied into the barrel instead.
 */
export async function embed(filePath: string, barrelPath: string): Promise<Embed> {
    const code = await readFile(filePath, "utf8")
    const { program } = parseSync(filePath, code)

    const importNodes: ImportDeclaration[] = []
    const contents: string[] = []
    const names = new Set<string>()
    const references = new Set<string>()

    for (const statement of program.body) {
        if (statement.type === "ImportDeclaration") {
            importNodes.push(statement)
            continue
        }

        const node = statement.type === "ExportNamedDeclaration" || statement.type === "ExportDefaultDeclaration"
            ? statement.declaration
            : statement

        if (node?.type === "TSTypeAliasDeclaration" || node?.type === "TSInterfaceDeclaration") {
            contents.push(code.slice(node.start, node.end))
            names.add(node.id.name)
            collectIdentifiers(node, references)
        }
    }

    const imports = importNodes.flatMap((node) => {
        const path = isRelative(node.source.value)
            ? resolveRelative(node.source.value, filePath)
            : undefined
        const from = path
            ? importPath(barrelPath, path, "js")
            : node.source.value
        return node.specifiers
            .filter(specifier => references.has(specifier.local.name))
            .map(specifier => ({
                code: `import ${printSpecifier(specifier)} from "${from}";`,
                name: specifier.local.name,
            }))
    })

    return { contents, imports, names }
}

function isRelative(specifier: string): boolean {
    return specifier.startsWith(".")
}

function printSpecifier(specifier: ImportDeclarationSpecifier): string {
    const local = specifier.local.name
    if (specifier.type === "ImportDefaultSpecifier") return local
    if (specifier.type === "ImportNamespaceSpecifier") return `* as ${local}`
    const imported = specifier.imported.type === "Identifier"
        ? specifier.imported.name
        : JSON.stringify(specifier.imported.value)
    return imported === local
        ? `{ ${local} }`
        : `{ ${imported} as ${local} }`
}

function collectIdentifiers(node: Node, identifiers: Set<string>): void {
    if (node.type === "Identifier") identifiers.add(node.name)
    for (const value of Object.values(node)) {
        if (!value || typeof value !== "object") continue
        for (const child of Array.isArray(value) ? value : [value]) {
            if (child && typeof child.type === "string") collectIdentifiers(child, identifiers)
        }
    }
}
