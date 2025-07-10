import type { Node } from "oxc-parser"
import type { GlobOptions } from "tinyglobby"
import type { FilterPattern } from "unplugin-utils"
import type { SourceExport } from "./SourceModule"
import Path from "node:path"
import { glob } from "tinyglobby"
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
    async default(path: string, options?: {
        alias?: string
        type?: boolean
    }): Promise<Source | undefined> {
        const module = await SourceModule.resolve(path)
        if (!module) return

        return {
            alias: options?.alias ?? "",
            dirPath: module.dirPath,
            extName: module.extName,
            isType: false,
            module,
            export: {
                identifier: "",
                isType: options?.type ?? false,
                type: "Default",
            },
        }
    },
    async exports(source: Source | readonly Source[]): Promise<readonly Source[]> {
        if (isArray(source)) {
            const exports = await Promise.all(source.map(source => Source.exports(source)))
            return exports.flat(1)
        }

        if (source.alias) return [source]

        if (!source.export) {
            const exports = await SourceModule.exports(source.module, true)
            return exports.map(ex => ({ ...source, export: ex }))
        }

        if (source.export.type === "Wildcard" && source.export.from && !source.alias) {
            const exports = await SourceModule.exports(source.export.from, true)
            return exports.map(ex => ({ ...source, export: ex }))
        }

        return [source]
    },
    async file(path: string, options?: {
        alias?: string
        type?: boolean
    }): Promise<Source | undefined> {
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
    async files(
        pattern: string | string[],
        options?: Omit<GlobOptions, "absolute" | "patterns" | "onlyFiles" | "onlyDirectories">,
    ): Promise<Source[]> {
        Barrel.watch(pattern, options?.cwd)
        const files = await glob(pattern, {
            ...options,
            absolute: true,
            onlyFiles: true,
        })
        const sources = await Promise.all(files.map(path => Source.file(path)))
        return sources.filter(source => !!source)
    },
    importFrom<T extends Source>(source: T, filePath: string): T {
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

        if (Path.isAbsolute(source.dirPath))
            source = Source.importFrom(source, "./index.ts")

        const extName = source.extName ? `.${source.extName}` : ""

        return [
            ...source.dirPath.split(Path.sep),
            `${source.module.fileName}${extName}`,
        ]
            .filter(Boolean)
            .join(Path.sep)
    },
    isTypeExport(source: Source): boolean {
        return source.export?.isType ?? false
    },
    isTypeImport(source: Source): boolean {
        return source.export?.isType ?? source.isType
    },
    matches(source: Source, pattern: Exclude<FilterPattern, null>): boolean {
        return SourceModule.matches(source.module, pattern)
    },
    async named(name: string, path: string, options?: {
        alias?: string
        type?: boolean
    }): Promise<Source | undefined> {
        const module = await SourceModule.resolve(path)
        if (!module) return

        return {
            alias: options?.alias ?? "",
            dirPath: module.dirPath,
            extName: module.extName,
            isType: false,
            module,
            export: {
                identifier: name,
                isType: options?.type ?? false,
                type: "Named",
            },
        }
    },
    remapExtension<T extends Source>(source: T, mapping: Record<string, string>): T {
        if (source.module.isExternal) return source
        if (!source.extName) return source
        if (!(source.extName in mapping)) return source
        const extName = mapping[source.extName] || ""
        return { ...source, extName }
    },
    removeExtension<T extends Source>(source: T): T {
        if (source.module.isExternal) return source
        return { ...source, extName: "" }
    },
    setImportAlias<T extends Source>(source: T, alias: string): T {
        return { ...source, alias }
    },
    toTypeImport<T extends Source>(source: T): T {
        return { ...source, isType: true }
    },
    walkAst(source: Source, options: {
        enter: (node: Node) => void | Promise<void>
        leave: (node: Node) => void | Promise<void>
    }): Promise<void> {
        return SourceModule.walkAst(source.module, options)
    },
    async wildcard(path: string, options?: {
        alias?: string
        type?: boolean
    }): Promise<Source | undefined> {
        const module = await SourceModule.resolve(path)
        if (!module) return

        return {
            alias: options?.alias ?? "",
            dirPath: module.dirPath,
            extName: module.extName,
            isType: false,
            module,
            export: {
                identifier: "",
                isType: options?.type ?? false,
                type: "Wildcard",
            },
        }
    },
}

function isArray(value: unknown): value is readonly unknown[] {
    return Array.isArray(value)
}
