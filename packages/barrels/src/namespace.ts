import type { ModuleExport } from "./internals/exports"
import type { Barrel, BarrelConfig, BarrelOptions } from "./types"
import Path from "node:path"
import { embed } from "./internals/embed"
import { readExports } from "./internals/exports"
import { globEntries, globFiles, importPath, isDeclarationFile } from "./internals/files"
import { padding, printBarrel, sortUnique } from "./internals/print"

interface NamespaceExport extends ModuleExport {
    filePath: string
}

/**
 * Creates an `index.js` and `index.d.ts` in each entry, exporting everything the collected files export
 * as an object named after the directory.
 */
export function namespace(options: BarrelOptions = {}): BarrelConfig {
    return async function () {
        const entries = await globEntries(options.entries)
        const barrels = await Promise.all(entries.map(async (entry): Promise<Barrel[]> => {
            const title = Path.basename(entry)
            const barrelPath = Path.join(entry, "index.js")
            const declarationPath = Path.join(entry, "index.d.ts")

            const files = await globFiles(entry, options, [barrelPath, declarationPath])
                .then(files => files.filter(file => !isDeclarationFile(file)))

            const exports = await Promise
                .all(files.map(async filePath => (await readExports(filePath)).map(ex => ({ ...ex, filePath }))))
                .then(exports => exports.flat())

            return [
                { contents: await printDeclaration(exports, title, declarationPath), path: declarationPath },
                { contents: printNamespace(exports, title, barrelPath), path: barrelPath },
            ]
        }))
        return barrels.flat()
    }
}

async function printDeclaration(exports: NamespaceExport[], title: string, barrelPath: string): Promise<string> {
    // A type with the same name as the namespace can not be imported, embed its file instead.
    const embeds = await Promise.all(sortUnique(exports
        .filter(ex => ex.isType && ex.name === title)
        .map(ex => ex.filePath))
        .map(async filePath => ({ ...await embed(filePath, barrelPath), filePath })))

    const isEmbedded = (ex: NamespaceExport): boolean => {
        return embeds.some(embed => embed.filePath === ex.filePath && embed.names.has(ex.name))
    }

    const imported = exports.filter(ex => !isEmbedded(ex))

    const imports = imported
        .map(ex => printImport(ex, barrelPath))
        .concat(embeds
            .flatMap(embed => embed.imports)
            // The embedded types might depend on something that is exported as well.
            .filter(({ name }) => !imported.some(ex => ex.name === name))
            .map(({ code }) => code))

    const values = exports
        .filter(ex => !ex.isType)
        .map(ex => ex.name)

    const types = exports
        .filter(ex => ex.isType)
        .map(ex => ex.name)

    return printBarrel([
        sortUnique(imports).join("\n"),
        ...embeds.flatMap(embed => embed.contents),
        [
            `declare namespace ${title} {`,
            `${padding}export {`,
            ...sortUnique(values).map(name => `${padding.repeat(2)}${name},`),
            `${padding}}`,
            "}",
        ].join("\n"),
        [
            "export {",
            ...Array.from(new Set([title, ...sortUnique(types)])).map(name => `${padding}${name},`),
            "}",
        ].join("\n"),
    ])
}

function printNamespace(exports: NamespaceExport[], title: string, barrelPath: string): string {
    const values = exports.filter(ex => !ex.isType)

    return printBarrel([
        sortUnique(values.map(ex => printImport(ex, barrelPath))).join("\n"),
        [
            `export const ${title} = {`,
            ...sortUnique(values.map(ex => ex.name)).map(name => `${padding}${name},`),
            "}",
        ].join("\n"),
    ])
}

function printImport(ex: NamespaceExport, barrelPath: string): string {
    return `import { ${ex.name} } from "${importPath(barrelPath, ex.filePath, "js")}";`
}
