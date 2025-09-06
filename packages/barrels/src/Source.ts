import type { Node } from "oxc-parser"
import type { FilterPattern } from "unplugin-utils"
import type { SourceExport } from "./SourceModule"
import Path from "node:path"
import { Barrel } from "./Barrel"
import { SourceModule } from "./SourceModule"

export interface Source {
    readonly alias: string
    readonly dirPath: string
    readonly export?: SourceExport
    readonly extName: string
    readonly isType: boolean
    readonly module: SourceModule
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Source = {
    asType(source: Source): Source {
        return { ...source, isType: true }
    },
    asValue(source: Source): Source {
        return { ...source, isType: false }
    },
    async exports(source: Source): Promise<Source[]> {
        if (source.alias) return [source]

        if (!source.export) {
            const exports = await SourceModule.exports(source.module, true)
            return exports.map(ex => ({ ...source, export: ex, isType: ex.isType }))
        }

        if (source.export.type === "Wildcard" && source.export.from && !source.alias) {
            const exports = await SourceModule.exports(source.export.from, true)
            return exports.map(ex => ({ ...source, export: ex, isType: ex.isType }))
        }

        return [source]
    },
    async file(path: string, options?: {
        alias?: string
        type?: boolean
    }): Promise<Source | undefined> {
        Barrel.watch(path)

        const module = await SourceModule.resolve(path)
            ?? await SourceModule.resolve(Path.resolve(path))

        if (!module) return

        return {
            alias: options?.alias ?? "",
            dirPath: module.dirPath,
            extName: module.extName,
            isType: options?.type ?? false,
            module,
        }
    },
    importFrom(source: Source, filePath: string): Source {
        if (source.module.isExternal) return source
        filePath = Path.resolve(filePath)
        const fromDir = Path.dirname(Path.resolve(filePath))
        const toDir = source.module.dirPath
        const relative = Path.relative(fromDir, toDir)
        const dirPath = relative.startsWith(".") ? relative : `./${relative}`
        return { ...source, dirPath }
    },
    importName(source: Source): string {
        return source.alias || source.export?.identifier || ""
    },
    importPath(source: Source): string {
        if (source.module.isExternal)
            return source.module.fileName

        const extName = source.extName ? `.${source.extName}` : ""

        return [
            ...source.dirPath.split(Path.sep),
            `${source.module.fileName}${extName}`,
        ]
            .filter(Boolean)
            .join(Path.sep)
    },
    isType(source: Source): boolean {
        return source.isType
    },
    matches(source: Source, pattern: Exclude<FilterPattern, null>): boolean {
        return SourceModule.matches(source.module, pattern)
    },
    remapExtension(source: Source, mapping: Record<string, string>): Source {
        if (source.module.isExternal) return source
        if (!source.extName) return source
        if (!(source.extName in mapping)) return source
        const extName = mapping[source.extName] || ""
        return { ...source, extName }
    },
    remapTsExtension(source: Source): Source {
        return Source.remapExtension(source, {
            mts: "mjs",
            mtsx: "mjsx",
            ts: "js",
            tsx: "jsx",
        })
    },
    removeExtension(source: Source): Source {
        if (source.module.isExternal) return source
        return { ...source, extName: "" }
    },
    resolveExtension(source: Source): Source {
        if (source.module.allowImportingTsExtensions)
            return source

        if (source.module.moduleResolution === "bundler")
            return Source.removeExtension(source)

        return Source.remapTsExtension(source)
    },
    setAlias(source: Source, alias: string): Source {
        return { ...source, alias }
    },
    toExport(source: Source): string {
        if (!source.export) {
            return wildcardExport({
                alias: source.alias,
                path: Source.importPath(source),
                type: Source.isType(source),
            })
        }

        if (source.export.type === "Default") {
            return defaultExport({
                alias: source.alias,
                path: Source.importPath(source),
                type: Source.isType(source),
            })
        }

        if (source.export.type === "Named") {
            return namedExport({
                alias: source.alias,
                name: source.export.identifier,
                path: Source.importPath(source),
                type: Source.isType(source),
            })
        }

        if (source.export.type === "Wildcard") {
            return wildcardExport({
                alias: source.alias,
                path: Source.importPath(source),
                type: Source.isType(source),
            })
        }

        return ""
    },
    toImport(source: Source): string {
        if (!source.export) {
            return wildcardImport({
                alias: source.alias,
                path: Source.importPath(source),
                type: Source.isType(source),
            })
        }

        if (source.export.type === "Default") {
            return defaultImport({
                alias: source.alias,
                path: Source.importPath(source),
                type: Source.isType(source),
            })
        }

        if (source.export.type === "Named") {
            return namedImport({
                alias: source.alias,
                name: source.export.identifier,
                path: Source.importPath(source),
                type: Source.isType(source),
            })
        }

        if (source.export.type === "Wildcard") {
            return wildcardImport({
                alias: source.alias,
                path: Source.importPath(source),
                type: Source.isType(source),
            })
        }

        return ""
    },
    walkAst(source: Source, options: {
        enter: (node: Node) => void | Promise<void>
        leave: (node: Node) => void | Promise<void>
    }): Promise<void> {
        return SourceModule.walkAst(source.module, options)
    },
}

function namedImport({ alias, name, path, type }: {
    alias?: string
    name: string
    path: string
    type?: boolean
}): string {
    if (!name || !path) return ""
    return [
        "import",
        type ? "type" : "",
        "{",
        name,
        alias ? `as ${alias}` : "",
        "}",
        "from",
        `"${path}";`,
    ]
        .filter(Boolean)
        .join(" ")
}

function namedExport({ alias, name, path, type }: {
    alias?: string
    name: string
    path: string
    type?: boolean
}): string {
    if (!name || !path) return ""
    return [
        "export",
        type ? "type" : "",
        "{",
        name,
        alias ? `as ${alias}` : "",
        "}",
        "from",
        `"${path}";`,
    ]
        .filter(Boolean)
        .join(" ")
}

function defaultImport({ alias, path, type }: {
    alias: string
    path: string
    type?: boolean
}): string {
    if (!path || !alias) return ""
    return [
        "import",
        type ? "type" : "",
        alias,
        "from",
        `"${path}";`,
    ]
        .filter(Boolean)
        .join(" ")
}

function defaultExport({ alias, path, type }: {
    alias?: string
    path: string
    type?: boolean
}): string {
    if (!path) return ""
    return [
        "export",
        type ? "type" : "",
        alias ? `{ default as ${alias} }` : "{ default }",
        "from",
        `"${path}";`,
    ]
        .filter(Boolean)
        .join(" ")
}

function wildcardImport({ alias, path, type }: {
    alias: string
    path: string
    type?: boolean
}): string {
    if (!path || !alias) return ""
    return [
        "import",
        type ? "type" : "",
        "*",
        alias ? `as ${alias}` : "",
        "from",
        `"${path}";`,
    ]
        .filter(Boolean)
        .join(" ")
}

function wildcardExport({ alias, path, type }: {
    alias?: string
    path: string
    type?: boolean
}): string {
    if (!path) return ""
    return [
        "export",
        type ? "type" : "",
        "*",
        alias ? `as ${alias}` : "",
        "from",
        `"${path}";`,
    ]
        .filter(Boolean)
        .join(" ")
}
