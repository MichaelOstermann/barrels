import type { BindingPattern, BindingProperty, BindingRestElement, Node } from "oxc-parser"
import type { Identifier } from "oxc-walker"
import type { TSConfckParseResult } from "tsconfck"
import type { FilterPattern } from "unplugin-utils"
import { readFile } from "node:fs/promises"
import Path from "node:path"
import { parseAsync } from "oxc-parser"
import { ResolverFactory } from "oxc-resolver"
import { walk } from "oxc-walker"
import { parse as parseTsConfig } from "tsconfck"
import { createFilter } from "unplugin-utils"
import { Barrel } from "./Barrel"

export interface SourceExport {
    readonly from?: SourceModule
    readonly identifier: string
    readonly isType: boolean
    readonly type: "Default" | "Wildcard" | "Named"
}

export interface SourceModule {
    readonly allowImportingTsExtensions: boolean | undefined
    readonly dirPath: string
    readonly extName: string
    readonly fileName: string
    readonly filePath: string
    readonly isExternal: boolean
    readonly moduleResolution: string | undefined
    readonly tsconfigPath: string
}

const conditionNames = [
    "node",
    "import",
]

const extensions = [
    ".ts",
    ".tsx",
    ".mts",
    ".mtsx",
    ".js",
    ".jsx",
    ".mjs",
    ".mjsx",
]

const esmResolver = new ResolverFactory()

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SourceModule = {
    async exports(module: SourceModule, deep?: boolean): Promise<readonly SourceExport[]> {
        let exports: SourceExport[] = []
        let namespaceDeclarationCount = 0

        await SourceModule.walkAst(module, {
            async enter(node) {
                if (namespaceDeclarationCount) return

                // export default foo
                if (node.type === "ExportDefaultDeclaration") {
                    exports.push({
                        identifier: "",
                        isType: false,
                        type: "Default",
                    })
                }

                // export * from "foo"
                else if (node.type === "ExportAllDeclaration") {
                    const fromModule = await SourceModule.resolve(node.source.value, module.filePath)
                    if (deep && fromModule) {
                        exports = exports.concat(await SourceModule.exports(fromModule, true))
                    }
                    else {
                        exports.push({
                            from: fromModule,
                            identifier: "",
                            isType: node.exportKind === "type",
                            type: "Wildcard",
                        })
                    }
                }

                else if (node.type === "ExportNamedDeclaration") {
                    if (node.declaration) {
                        // export const foo = {}
                        // export const {}
                        // export const []
                        // export const {} = foo
                        // export const [] = foo
                        if ("declarations" in node.declaration) {
                            for (const binding of node.declaration.declarations) {
                                for (const identifier of resolveIdentifier(binding.id)) {
                                    exports.push({
                                        identifier,
                                        isType: node.exportKind === "type",
                                        type: "Named",
                                    })
                                }
                            }
                        }

                        // export class Foo {}
                        // export function Foo() {}
                        // export namespace Foo {}
                        // export enum Foo {}
                        // export type Foo = {}
                        // export interface Foo {}
                        else if ("id" in node.declaration && node.declaration.id?.type === "Identifier") {
                            if (node.declaration.type === "TSModuleDeclaration") namespaceDeclarationCount++
                            exports.push({
                                identifier: node.declaration.id.name,
                                isType: node.exportKind === "type",
                                type: "Named",
                            })
                        }
                    }

                    // export { foo } from "foo"
                    // export { default } from "foo"
                    // export * as Foo from "foo"
                    if (node.source?.value) {
                        const fromModule = await SourceModule.resolve(node.source.value, module.filePath)
                        for (const specifier of node.specifiers) {
                            if (specifier.exported.type === "Identifier") {
                                exports.push({
                                    from: fromModule,
                                    identifier: specifier.exported.name,
                                    isType: specifier.exportKind === "type",
                                    type: specifier.exported.name === "default" ? "Default" : "Named",
                                })
                            }
                        }
                    }
                }
            },
            leave(node) {
                if (node.type === "ExportNamedDeclaration" && node.declaration?.type === "TSModuleDeclaration") {
                    namespaceDeclarationCount--
                }
            },
        })

        return exports
    },
    matches(module: SourceModule, pattern: Exclude<FilterPattern, null>): boolean {
        return createFilter(pattern)(module.filePath)
    },
    async resolve(path: string, fromFilePath?: string): Promise<SourceModule | undefined> {
        const absDirPath = fromFilePath
            // oxc-resolver requires an absolute path to a directory.
            ? Path.dirname(Path.resolve(fromFilePath))
            : process.cwd()

        // Remove the extension so we can resolve eg. "foo.js" to "foo.ts".
        const targetPath = Path.extname(path).length
            ? path.slice(0, -Path.extname(path).length)
            : path

        const { tsconfig, tsconfigFile } = await (async function (): Promise<TSConfckParseResult> {
            if (fromFilePath?.includes("node_modules")) return { tsconfig: {}, tsconfigFile: "" }
            const targetDir = Path.dirname(Path.resolve(fromFilePath || path))
            // tsconfck requires an absolute path to a file.
            const targetFile = Path.join(targetDir, "index.ts")
            return parseTsConfig(targetFile)
        })()

        const tsconfigPath = tsconfigFile || ""
        const allowImportingTsExtensions = tsconfig.compilerOptions?.allowImportingTsExtensions
        const moduleResolution = tsconfig.compilerOptions?.moduleResolution

        Barrel.watch(path)
        Barrel.watch(absDirPath)
        Barrel.watch(tsconfigPath)

        const resolved = await esmResolver
            .cloneWithOptions({
                conditionNames,
                extensions,
                tsconfig: tsconfigPath
                    ? { configFile: tsconfigPath, references: "auto" }
                    : undefined,
            })
            .async(absDirPath, targetPath)

        if (!resolved.path) return undefined

        const isExternal = resolved.packageJsonPath?.includes("node_modules") ?? false
        const extName = Path.extname(resolved.path).slice(1)
        const fileName = isExternal ? path : Path.basename(resolved.path, Path.extname(resolved.path))
        const dirPath = Path.dirname(resolved.path)

        return {
            allowImportingTsExtensions,
            dirPath,
            extName,
            fileName,
            filePath: resolved.path,
            isExternal,
            moduleResolution,
            tsconfigPath,
        }
    },
    async walkAst(module: SourceModule, options: {
        enter: (node: Node) => void | Promise<void>
        leave: (node: Node) => void | Promise<void>
    }): Promise<void> {
        const nodes: { enter: boolean, node: Node }[] = []

        const ast = await readFile(module.filePath, "utf8")
            .catch(() => "")
            .then(contents => parseAsync(module.filePath, contents))
            .then(ast => ast.program)

        walk(ast, {
            enter(node) {
                nodes.push({ enter: true, node })
            },
            leave(node) {
                nodes.push({ enter: false, node })
            },
        })

        for (const { enter, node } of nodes) {
            await (enter ? options.enter(node) : options.leave(node))
        }
    },
}

function resolveIdentifier(pattern: BindingPattern | BindingProperty | BindingRestElement | Identifier | null): string[] {
    if (pattern == null) return []
    if (pattern.type === "Identifier") return [pattern.name]
    if (pattern.type === "ArrayPattern") return pattern.elements.flatMap(resolveIdentifier)
    if (pattern.type === "RestElement") return resolveIdentifier(pattern.argument)
    if (pattern.type === "ObjectPattern") return pattern.properties.flatMap(resolveIdentifier)
    if (pattern.type === "Property" && pattern.key.type === "Identifier") return resolveIdentifier(pattern.key)
    if (pattern.type === "AssignmentPattern") return resolveIdentifier(pattern.left)
    return []
}
