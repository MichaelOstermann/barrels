import type { Source } from "@monstermann/barrels"
import type { FilterPattern } from "unplugin-utils"
import Path from "node:path"
import { Barrel, Sources } from "@monstermann/barrels"
import { pipe } from "@monstermann/dfdl"

export interface NamespaceBarrelConfig {
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
    include?: string | string[] | ((ctx: { entry: string, outDir: string, title: string }) => string | string[])
    /**
     * The directory where the barrel files should be created.
     * Will be resolved against the current entry.
     * @default entry
     */
    outDir?: string | ((ctx: { entry: string, title: string }) => string)
    /**
     * The name without extension that should be used to create the `.d.ts` and `.js` files.
     * @default outDir === entry ? "index" : title
     */
    outName?: string | ((ctx: { entry: string, outDir: string, title: string }) => string)
    /**
     * The title of the namespace.
     * @default Path.basename(entry)
     */
    title?: string | ((ctx: { entry: string }) => string)
}

export function namespace(options: NamespaceBarrelConfig): () => Promise<void> {
    return async function () {
        const directories = await Barrel.globDirectories(options.entries)
        await Promise.all(directories.map(async (entry) => {
            const title = pipe(
                options.title,
                title => typeof title === "function" ? title({ entry }) : title,
                title => title || Path.basename(entry),
            )

            const outDir = pipe(
                options.outDir,
                outDir => outDir || "",
                outDir => typeof outDir === "function" ? outDir({ entry, title }) : outDir,
                outDir => Path.resolve(entry, outDir),
            )

            const outName = pipe(
                options.outName,
                outName => typeof outName === "function" ? outName({ entry, outDir, title }) : outName,
                outName => outName || (outDir === entry ? "index" : title),
                outName => Path.resolve(outDir, outName),
            )

            const include = pipe(
                options.include,
                include => typeof include === "function" ? include({ entry, outDir, title }) : include,
                include => include || "*.ts",
            )

            const declarationPath = Path.resolve(outDir, `${outName}.d.ts`)
            const barrelPath = Path.resolve(outDir, `${outName}.js`)

            const files = await Barrel.globFiles(include, {
                cwd: entry,
                ignore: [declarationPath, barrelPath],
            })

            const sources = await Sources.files(files)
                .then(sources => options.exclude ? Sources.exclude(sources, options.exclude) : sources)
                .then(sources => Sources.exports(sources))
                .then(sources => Sources.importFrom(sources, barrelPath))

            const namespaceName = getNamespaceTitle(title, barrelPath)
            await Barrel.write(declarationPath, generateDeclaration(sources, namespaceName))
            await Barrel.write(barrelPath, generateBarrel(sources, namespaceName))
        }))
    }
}

function generateDeclaration(
    sources: Source[],
    title: string,
): string {
    const padding = " ".repeat(4)

    const modules = pipe(
        sources,
        sources => Sources.filterNamed(sources),
        sources => Sources.remapExtensions(sources, {
            mts: "mjs",
            mtsx: "mjsx",
            ts: "js",
            tsx: "jsx",
        }),
    )

    const imports = pipe(
        modules,
        modules => Sources.asValues(modules),
        modules => Sources.toImports(modules),
    )

    const namespaceExports = pipe(
        modules,
        modules => Sources.filterValues(modules),
        modules => Sources.importNames(modules),
        names => sort(names),
        names => names.map(name => `${padding.repeat(2)}${name},`),
        names => names.join("\n"),
    )

    const moduleExports = pipe(
        modules,
        modules => Sources.filterTypes(modules),
        modules => Sources.importNames(modules),
        names => names.concat([title]),
        names => uniq(names),
        names => sort(names),
        names => names.map(name => `${padding}${name},`),
        names => names.join("\n"),
    )

    return [
        Barrel.banner,
        "",
        imports,
        "",
        `declare namespace ${title} {`,
        `${padding}export {`,
        namespaceExports,
        `${padding}}`,
        "}",
        "",
        "export {",
        moduleExports,
        "}",
    ].join("\n")
}

function generateBarrel(
    sources: Source[],
    title: string,
): string {
    const padding = " ".repeat(4)

    const modules = pipe(
        sources,
        sources => Sources.filterNamed(sources),
        sources => Sources.filterValues(sources),
        sources => Sources.remapExtensions(sources, {
            mts: "mjs",
            mtsx: "mjsx",
            ts: "js",
            tsx: "jsx",
        }),
    )

    const imports = Sources.toImports(modules)

    const properties = pipe(
        modules,
        modules => Sources.importNames(modules),
        names => names.map(name => `${padding}${name},`),
        names => names.join("\n"),
    )

    return [
        Barrel.banner,
        "",
        imports,
        "",
        `export const ${title} = {`,
        properties,
        "}",
    ].join("\n")
}

function getNamespaceTitle(name: string | undefined, entry: string): string {
    if (name) return name
    const filename = Path.basename(entry, Path.extname(entry))
    if (filename !== "index") return filename
    return Path.basename(Path.dirname(entry))
}

function uniq(list: string[]): string[] {
    return Array.from(new Set(list))
}

function sort(list: string[]): string[] {
    return list.sort((a, b) => a.localeCompare(b, "en-US"))
}
