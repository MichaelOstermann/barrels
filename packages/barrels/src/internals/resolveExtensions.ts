import type { BarrelConfig } from "../types"
import { Source } from "../Source"

export function resolveExtensions(sources: Source[], config: BarrelConfig): Source[] {
    const extensions = config.extensions ?? "auto"

    if (extensions === false)
        return sources.map(source => Source.removeExtension(source))

    if (typeof extensions === "object")
        return sources.map(source => Source.remapExtension(source, extensions))

    if (extensions === "auto") {
        return sources.map((source) => {
            if (source.module.allowImportingTsExtensions) return source
            if (source.module.moduleResolution === "bundler") return Source.removeExtension(source)
            return Source.remapExtension(source, {
                mts: "mjs",
                mtsx: "mjsx",
                ts: "js",
                tsx: "jsx",
            })
        })
    }

    return sources
}
