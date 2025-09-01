import type { FilterPattern } from "unplugin-utils"
import Path from "node:path"
import { Barrel, Sources } from "@monstermann/barrels"
import { pipe } from "@monstermann/dfdl"

export interface FlatBarrelConfig {
    /**
     * Glob(s) to directories to create barrel files in.
     * @default process.cwd()
     */
    entries?: string | string[]
    /**
     * Glob(s) or RegExp(s) to exclude matched files.
     * @default undefined
     */
    exclude?: Exclude<FilterPattern, null>
    /**
     * Glob(s) to collect files, relative to each entry.
     * @default "*.ts"
     */
    include?: string | string[] | ((ctx: { entry: string, outDir: string }) => string | string[])
    /**
     * The directory where the barrel files should be created.
     * Will be resolved against the current entry.
     * @default entry
     */
    outDir?: string | ((ctx: { entry: string }) => string)
    /**
     * The file name used to create the barrel file within `outDir`.
     * @default "index.ts"
     */
    outFile?: string | ((ctx: { entry: string, outDir: string }) => string)
}

export function flat(options: FlatBarrelConfig): () => Promise<void> {
    return async function () {
        const directories = await Barrel.globDirectories(options.entries)
        await Promise.all(directories.map(async (entry) => {
            const outDir = pipe(
                options.outDir,
                outDir => typeof outDir === "function" ? outDir({ entry }) : outDir,
                outDir => outDir || "",
                outDir => Path.resolve(entry, outDir),
            )

            const outFile = pipe(
                options.outFile,
                outFile => typeof outFile === "function" ? outFile({ entry, outDir }) : outFile,
                outFile => outFile || "index.ts",
                outFile => Path.resolve(outDir, outFile),
            )

            const include = pipe(
                options.include,
                include => typeof include === "function" ? include({ entry, outDir }) : include,
                include => include || "*.ts",
            )

            const files = await Barrel.globFiles(include, {
                cwd: entry,
                ignore: [outFile],
            })

            const sources = await Sources.files(files)
                .then(sources => options.exclude ? Sources.exclude(sources, options.exclude) : sources)
                .then(sources => Sources.importFrom(sources, outFile))
                .then(sources => Sources.resolveExtensions(sources))
                .then(sources => Sources.toExports(sources))

            await Barrel.write(outFile, sources)
        }))
    }
}
