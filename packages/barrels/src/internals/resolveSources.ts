import type { BarrelConfig } from "../types"
import { Source } from "../Source"
import { resolveExtensions } from "./resolveExtensions"

export async function resolveSources(
    directory: string,
    output: string,
    config: BarrelConfig,
): Promise<Source[]> {
    let sources = await Source.files(config.files, {
        cwd: directory,
        ignore: [output],
    })

    if (config.include)
        sources = sources.filter(source => Source.matches(source, config.include!))

    if (config.exclude)
        sources = sources.filter(source => !Source.matches(source, config.exclude!))

    const resolveExports = config.resolveExports
        ?? (config.type === "namespace" || config.type === "record")

    if (resolveExports)
        sources = [...await Source.exports(sources)]

    if (config.transformSources)
        sources = await config.transformSources(sources)

    sources = resolveExtensions(sources, config)
    sources = sources.map(source => Source.importFrom(source, output))

    return sources
}
