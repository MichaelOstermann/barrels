import type { BarrelConfig } from "../types"
import Path from "node:path"

export function resolveOutput(
    directory: string,
    options: BarrelConfig,
): string {
    if (!options.output)
        return Path.resolve(directory, "index.ts")

    if (typeof options.output === "function")
        return Path.resolve(directory, options.output(directory))

    return Path.resolve(directory, options.output)
}
