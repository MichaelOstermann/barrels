import type { ParseResult, StaticExportEntry } from "oxc-parser"
import { readFile } from "node:fs/promises"
import { parseSync } from "oxc-parser"
import { resolveRelative } from "./files"

export interface ModuleExport {
    isType: boolean
    name: string
}

/** Collects the names a file exports, following relative `export * from "./foo"`. */
export async function readExports(filePath: string, seen = new Set<string>()): Promise<ModuleExport[]> {
    if (seen.has(filePath)) return []
    seen.add(filePath)

    const code = await readFile(filePath, "utf8")
    // Only reading the module record skips deserializing the AST.
    const result = parseSync(filePath, code)
    const exports: ModuleExport[] = []
    let localTypes: Set<string> | undefined

    for (const { entries } of result.module.staticExports) {
        for (const entry of entries) {
            // export * from "./foo"
            if (entry.exportName.kind === "None") {
                const fromPath = entry.moduleRequest && resolveRelative(entry.moduleRequest.value, filePath)
                if (!fromPath) continue
                for (const ex of await readExports(fromPath, seen)) {
                    exports.push({ isType: ex.isType || entry.isType, name: ex.name })
                }
            }

            else if (entry.exportName.kind === "Name" && entry.exportName.name && entry.exportName.name !== "default") {
                const name = entry.exportName.name
                // type Foo = {}; export { Foo }
                const isType = entry.isType || (isLocalSpecifier(entry) && (localTypes ??= collectLocalTypes(result)).has(entry.localName.name!))
                exports.push({ isType, name })
            }
        }
    }

    return exports
}

function isLocalSpecifier(entry: StaticExportEntry): boolean {
    return entry.localName.kind === "Name"
        && entry.localName.start === entry.start
}

function collectLocalTypes(result: ParseResult): Set<string> {
    const types = new Set<string>()
    const values = new Set<string>()

    for (const node of result.program.body) {
        if (node.type === "TSTypeAliasDeclaration" || node.type === "TSInterfaceDeclaration") {
            types.add(node.id.name)
        }
        else if (node.type === "VariableDeclaration") {
            for (const declaration of node.declarations) {
                if (declaration.id.type === "Identifier") values.add(declaration.id.name)
            }
        }
        else if ("id" in node && node.id?.type === "Identifier") {
            values.add(node.id.name)
        }
    }

    for (const name of values) types.delete(name)
    return types
}
