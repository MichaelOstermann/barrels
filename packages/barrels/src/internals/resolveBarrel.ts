import type { Source } from "../Source"
import type { BarrelConfig } from "../types"
import Path from "node:path"
import { Barrel } from "../Barrel"
import { resolveBanner } from "./resolveBanner"

export async function resolveBarrel(
    output: string,
    sources: Source[],
    config: BarrelConfig,
): Promise<string> {
    const banner = resolveBanner(config)
    const body = resolveBarrelBody(output, sources, config)

    const result = [banner, body]
        .filter(Boolean)
        .join("\n\n")

    return config.transformBarrel
        ? await config.transformBarrel(result)
        : result
}

function resolveBarrelBody(
    output: string,
    sources: Source[],
    config: BarrelConfig,
): string {
    if (config.type === "flat") return Barrel.flat(sources)

    if (config.type === "namespace") {
        return Barrel.namespace(sources, {
            indentation: config.indentation,
            name: resolveBarrelName(output, config),
            types: config.types,
        })
    }

    if (config.type === "record") {
        return Barrel.record(sources, {
            indentation: config.indentation,
            name: resolveBarrelName(output, config),
        })
    }

    return ""
}

function resolveBarrelName(
    output: string,
    config: BarrelConfig,
): string {
    if (config.type === "flat") return ""
    if (typeof config.name === "string") return config.name
    if (typeof config.name === "function") return config.name(output)
    const fileName = Path.basename(output, Path.extname(output))
    if (fileName !== "index") return fileName
    return Path.basename(Path.dirname(output))
}
