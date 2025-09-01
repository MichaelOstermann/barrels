import type { FilterPattern } from "unplugin-utils"
import { Source } from "./Source"

export const Sources = {
    asTypes(sources: Source[]): Source[] {
        return sources.map(source => Source.asType(source))
    },
    asValues(sources: Source[]): Source[] {
        return sources.map(source => Source.asValue(source))
    },
    exclude(sources: Source[], pattern: Exclude<FilterPattern, null>): Source[] {
        return sources.filter(source => !Source.matches(source, pattern))
    },
    exports(sources: Source[]): Promise<Source[]> {
        return Promise
            .all(sources.map(source => Source.exports(source)))
            .then(sources => sources.flat(1))
    },
    files(paths: string[], options?: {
        alias?: string
        type?: boolean
    }): Promise<Source[]> {
        return Promise
            .all(paths.map(path => Source.file(path, options)))
            .then(sources => sources.filter(source => !!source))
    },
    filterNamed(sources: Source[]): Source[] {
        return sources.filter(source => Source.importName(source))
    },
    filterTypes(sources: Source[]): Source[] {
        return sources.filter(source => Source.isType(source))
    },
    filterValues(sources: Source[]): Source[] {
        return sources.filter(source => !Source.isType(source))
    },
    importFrom(sources: Source[], filePath: string): Source[] {
        return sources.map(source => Source.importFrom(source, filePath))
    },
    importNames(sources: Source[]): string[] {
        return Array
            .from(new Set(sources.map(source => Source.importName(source))))
            .filter(name => name.trim())
            .filter(Boolean)
    },
    include(sources: Source[], pattern: Exclude<FilterPattern, null>): Source[] {
        return sources.filter(source => Source.matches(source, pattern))
    },
    remapExtensions(sources: Source[], mapping: Record<string, string>): Source[] {
        return sources.map(source => Source.remapExtension(source, mapping))
    },
    removeExtensions(sources: Source[]): Source[] {
        return sources.map(source => Source.removeExtension(source))
    },
    resolveExtensions(sources: Source[]): Source[] {
        return sources.map(source => Source.resolveExtension(source))
    },
    toExports(sources: Source[]): string {
        return Array
            .from(new Set(sources.map(source => Source.toExport(source))))
            .sort((a, b) => a.localeCompare(b, "en-US"))
            .join("\n")
    },
    toImports(sources: Source[]): string {
        return Array
            .from(new Set(sources.map(source => Source.toImport(source))))
            .sort((a, b) => a.localeCompare(b, "en-US"))
            .join("\n")
    },
}
