/* eslint-disable no-console */
import type { ImportDeclaration, ImportDeclarationSpecifier } from "oxc-parser"
import type { Import } from "./analyze"
import type { TreeShakeImportData, TreeShakeImportsOptions, TreeShakeImportsResult } from "./types"
import { styleText } from "node:util"
import MagicString from "magic-string"
import { parseSync } from "oxc-parser"
import { analyze } from "./analyze"

/**
 * Replaces the members of imported namespaces with direct imports:
 *
 * ```ts
 * import { Foo } from "foo";
 * Foo.bar();
 * ```
 *
 * ```ts
 * import { bar as _bar } from "foo/bar";
 * _bar();
 * ```
 *
 * Returns `undefined` when nothing changed.
 */
export function transform(
    code: string,
    filePath: string,
    { debug, resolve }: TreeShakeImportsOptions,
): TreeShakeImportsResult | undefined {
    // Nothing to do without imports, skip parsing.
    if (!code.includes("import")) return

    const resolvers = Array.isArray(resolve) ? resolve : [resolve]
    const identifiers = new Set<string>()
    const imports = analyze(parseSync(filePath, code).program, identifiers)

    const ms = new MagicString(code, { filename: filePath })
    const removed = new Map<ImportDeclaration, Set<ImportDeclarationSpecifier>>()
    const added = new Map<ImportDeclaration, string[]>()

    if (debug) console.log(styleText("cyan", `Transforming: ${filePath}`))

    for (const data of imports.values()) {
        // Something needs the namespace itself, leave it alone.
        if (data.isUsedBare || !data.members.size) continue

        const aliases = resolveMembers(data)
        if (!aliases) continue

        for (const [propertyName, { alias }] of aliases) {
            for (const member of data.members.get(propertyName)!) {
                ms.overwrite(member.start, member.end, alias)
            }
        }

        const newImports = Array.from(aliases.values(), ({ code }) => code)
        // Types are not available from the resolved imports.
        if (data.isUsedAsType) newImports.push(printTypeImport(data))

        getOrInsert(removed, data.declaration, () => new Set()).add(data.specifier)
        getOrInsert(added, data.declaration, () => []).push(...newImports)
    }

    if (!removed.size) return

    for (const [declaration, specifiers] of removed) {
        const kept = declaration.specifiers.filter(specifier => !specifiers.has(specifier))
        const lines = added.get(declaration)!
        if (kept.length) lines.unshift(printImport(declaration, kept))
        if (debug) {
            console.log(styleText("red", `- ${code.slice(declaration.start, declaration.end)}`))
            console.log(styleText("green", lines.map(line => `+ ${line}`).join("\n")))
        }
        ms.overwrite(declaration.start, declaration.end, lines.join("\n"))
    }

    return {
        code: ms.toString(),
        get map() {
            return ms.generateMap({
                hires: "boundary",
                includeContent: true,
                source: filePath,
            })
        },
    }

    function resolveMembers(data: Import): Map<string, { alias: string, code: string }> | undefined {
        const aliases = new Map<string, { alias: string, code: string }>()

        for (const propertyName of data.members.keys()) {
            const importData: TreeShakeImportData = {
                filePath,
                importAlias: createAlias(propertyName),
                importName: getImportName(data.specifier),
                importPath: data.declaration.source.value,
                localName: data.specifier.local.name,
                propertyName,
                scope: identifiers,
            }

            let resolved: ReturnType<typeof resolvers[number]>
            for (const resolver of resolvers) {
                resolved = resolver(importData)
                if (resolved) break
            }

            if (debug) console.log(styleText("magenta", `${importData.localName}.${propertyName}:`), resolved)

            // All or nothing, the namespace has to stay if one of its members does.
            if (!resolved) return

            const alias = getAlias(resolved, importData.importAlias)
            identifiers.add(alias)
            aliases.set(propertyName, { alias, code: resolved })
        }

        return aliases
    }

    function createAlias(name: string): string {
        let counter = 0
        let alias = `_${name}`
        while (identifiers.has(alias)) alias = `_${name}${++counter}`
        return alias
    }

    function printImport(declaration: ImportDeclaration, specifiers: ImportDeclarationSpecifier[]): string {
        // import { Foo, type Bar } → import type { Bar }, so nothing is left behind that loads the module.
        const isType = specifiers.every(specifier => specifier.type === "ImportSpecifier" && specifier.importKind === "type")
        const named = specifiers
            .filter(specifier => specifier.type === "ImportSpecifier")
            .map(specifier => code.slice(isType ? specifier.imported.start : specifier.start, specifier.end))
        const clause = specifiers
            .filter(specifier => specifier.type !== "ImportSpecifier")
            .map(specifier => code.slice(specifier.start, specifier.end))
            .concat(named.length ? `{ ${named.join(", ")} }` : [])
        // Keeps import attributes: import foo from "foo" with { type: "json" }
        return `import ${isType ? "type " : ""}${clause.join(", ")} from ${code.slice(declaration.source.start, declaration.end)}`
    }

    function printTypeImport({ declaration, specifier }: Import): string {
        const clause = code.slice(specifier.start, specifier.end)
        const source = code.slice(declaration.source.start, declaration.source.end)
        return `import type ${specifier.type === "ImportSpecifier" ? `{ ${clause} }` : clause} from ${source};`
    }
}

function getImportName(specifier: ImportDeclarationSpecifier): string | undefined {
    if (specifier.type === "ImportDefaultSpecifier") return undefined
    if (specifier.type === "ImportNamespaceSpecifier") return "*"
    return specifier.imported.type === "Literal"
        ? specifier.imported.value
        : specifier.imported.name
}

/** The local name of the import returned by a resolver. */
function getAlias(resolved: string, suggested: string): string {
    // Resolvers are expected to use the alias they have been given, avoid parsing in that case.
    if (new RegExp(`(?<![\\w$])${suggested.replaceAll("$", "\\$")}(?![\\w$])`).test(resolved)) return suggested
    const alias = parseSync("import.ts", resolved).module.staticImports.at(-1)?.entries.at(-1)?.localName.value
    if (!alias) throw new Error(`tree-shake-import-namespaces: Could not extract valid import name from "${resolved}"`)
    return alias
}

function getOrInsert<K, V>(map: Map<K, V>, key: K, create: () => V): V {
    let value = map.get(key)
    if (value === undefined) map.set(key, value = create())
    return value
}
