import type { Barrel, BarrelConfig } from "./types"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import Path from "node:path"

/**
 * Runs the configs one after another, so a config can collect the barrels created by a previous one.
 * Returns the barrels that have been written, untouched ones are skipped.
 */
export async function run(configs: BarrelConfig[]): Promise<Barrel[]> {
    const written: Barrel[] = []

    for (const config of configs) {
        const barrels = await config()
        await Promise.all(barrels.map(async (barrel) => {
            if (await write(barrel)) written.push(barrel)
        }))
    }

    return written
}

async function write({ contents, path }: Barrel): Promise<boolean> {
    // Check whether anything changed before writing, mostly there to prevent infinite loops in the file watcher.
    const existing = await readFile(path, "utf8").catch(() => null)
    if (existing === contents) return false

    await mkdir(Path.dirname(path), { recursive: true })
    await writeFile(path, contents)
    return true
}
