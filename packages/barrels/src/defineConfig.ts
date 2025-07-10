import type { BarrelConfig, BarrelsOutput, CustomBarrelConfig } from "./types"
import { Barrel } from "./Barrel"
import { runConfig } from "./internals/context"
import { resolveBarrel } from "./internals/resolveBarrel"
import { resolveDirectories } from "./internals/resolveDirectories"
import { resolveOutput } from "./internals/resolveOutput"
import { resolveSources } from "./internals/resolveSources"

type Config =
    | BarrelConfig
    | CustomBarrelConfig
    | (() => Promise<BarrelsOutput>)

export function defineConfig(
    configs: Config[],
): () => Promise<BarrelsOutput> {
    return () => runConfig(async () => {
        for (const config of configs) {
            try {
                if (typeof config === "function") {
                    await config()
                }
                else {
                    const directories = await resolveDirectories(config)
                    await Promise.all(directories.map(async (directory) => {
                        const output = resolveOutput(directory, config)
                        const sources = await resolveSources(directory, output, config)
                        const barrel = await resolveBarrel(output, sources, config)
                        await Barrel.write(output, barrel)
                    }))
                }
            }
            catch (error) {
                console.error(error)
            }
        }
    })
}
