import type { BarrelConfig } from "../types"
import { glob } from "tinyglobby"
import { Barrel } from "../Barrel"

export async function resolveDirectories(
    options: BarrelConfig,
): Promise<string[]> {
    if (!options.directories) return [process.cwd()]
    Barrel.watch(options.directories)
    return glob(options.directories, {
        absolute: true,
        expandDirectories: false,
        onlyDirectories: true,
    })
}
