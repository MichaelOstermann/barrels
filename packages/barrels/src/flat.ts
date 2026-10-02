import type { BarrelConfig, BarrelOptions } from "./types"
import Path from "node:path"
import { globEntries, globFiles, importPath } from "./internals/files"
import { printBarrel, sortUnique } from "./internals/print"

/**
 * Creates an `index.ts` in each entry, re-exporting everything from the collected files.
 */
export function flat(options: BarrelOptions = {}): BarrelConfig {
    return async function () {
        const entries = await globEntries(options.entries)
        return Promise.all(entries.map(async (entry) => {
            const barrelPath = Path.join(entry, "index.ts")
            const files = await globFiles(entry, options, [barrelPath])
            const exports = files.map(file => `export * from "${importPath(barrelPath, file, "none")}";`)
            return {
                contents: printBarrel([sortUnique(exports).join("\n")]),
                path: barrelPath,
            }
        }))
    }
}
