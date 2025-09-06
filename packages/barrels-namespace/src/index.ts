import type { FilterPattern } from "unplugin-utils"
import Path from "node:path"
import { Barrel, Source, Sources } from "@monstermann/barrels"
import { pipe } from "@monstermann/dfdl"
import { embeds } from "./embed"

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

            const namespaceName = getNamespaceTitle(title, barrelPath)
            await Barrel.write(declarationPath, await generateDeclaration(sources, namespaceName, barrelPath))
            await Barrel.write(barrelPath, generateBarrel(sources, namespaceName, barrelPath))
        }))
    }
}

async function generateDeclaration(
    sources: Source[],
    title: string,
    importPath: string,
): Promise<string> {
    const padding = " ".repeat(4)

    const conflicts = pipe(
        sources,
        sources => Sources.filterNamed(sources),
        sources => Sources.filterTypes(sources),
        sources => sources.filter(source => Source.importName(source) === title),
    )

    const conflictedPaths = conflicts.map(source => source.module.filePath)
    const embed = await embeds(conflicts)

    const moduleImports = pipe(
        sources,
        sources => Sources.filterNamed(sources),
        sources => sources.filter(source => !conflictedPaths.includes(source.module.filePath)),
        sources => sources.concat(embed.imports),
        sources => Sources.importFrom(sources, importPath),
        sources => Sources.remapTsExtensions(sources),
        sources => Sources.asValues(sources),
        sources => Sources.toImports(sources),
    )

    const moduleExports = pipe(
        sources,
        sources => Sources.filterNamed(sources),
        sources => Sources.filterTypes(sources),
        sources => Sources.importNames(sources),
        names => [title].concat(names),
        names => Array.from(new Set(names)),
        names => names.map(name => `${padding}${name},`),
        names => names.join("\n"),
        exports => `export {\n${exports}\n}`,
    )

    const namespaceExports = pipe(
        sources,
        sources => Sources.filterNamed(sources),
        sources => Sources.filterValues(sources),
        sources => Sources.importNames(sources),
        names => names.map(name => `${padding.repeat(2)}${name},`),
        names => names.join("\n"),
    )

    const namespace = [
        `declare namespace ${title} {`,
        `${padding}export {`,
        namespaceExports,
        `${padding}}`,
        "}",
    ].join("\n")

    return [
        Barrel.banner,
        moduleImports,
        ...embed.contents,
        namespace,
        moduleExports,
    ]
        .filter(Boolean)
        .join("\n\n")
}

function generateBarrel(
    sources: Source[],
    title: string,
    importPath: string,
): string {
    const padding = " ".repeat(4)

    const imports = pipe(
        sources,
        sources => Sources.filterNamed(sources),
        sources => Sources.filterValues(sources),
        sources => Sources.remapTsExtensions(sources),
        sources => Sources.importFrom(sources, importPath),
        sources => Sources.toImports(sources),
    )

    const properties = pipe(
        sources,
        sources => Sources.filterNamed(sources),
        sources => Sources.filterValues(sources),
        sources => Sources.importNames(sources),
        names => names.map(name => `${padding}${name},`),
        names => names.join("\n"),
    )

    const record = [
        `export const ${title} = {`,
        properties,
        "}",
    ].join("\n")

    return [
        Barrel.banner,
        imports,
        record,
    ]
        .filter(Boolean)
        .join("\n\n")
}

function getNamespaceTitle(name: string | undefined, entry: string): string {
    if (name) return name
    const filename = Path.basename(entry, Path.extname(entry))
    if (filename !== "index") return filename
    return Path.basename(Path.dirname(entry))
}
