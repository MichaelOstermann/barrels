import type { BarrelOptions } from "../types"
import { statSync } from "node:fs"
import Path from "node:path"
import { glob } from "tinyglobby"

const sourceExtensions = [".ts", ".tsx", ".mts", ".js", ".jsx", ".mjs"]

const declarationExtension = /\.d\.m?ts$/

export async function globEntries(entries: BarrelOptions["entries"]): Promise<string[]> {
    if (!entries || !entries.length) return [process.cwd()]
    const paths = await glob(entries, {
        absolute: true,
        expandDirectories: false,
        onlyDirectories: true,
    })
    return paths.map(path => Path.resolve(path))
}

export async function globFiles(entry: string, options: BarrelOptions, ignore: string[]): Promise<string[]> {
    const paths = await glob(options.include || ["*.ts", "*.tsx"], {
        absolute: true,
        cwd: entry,
        ignore: ignore.concat(options.exclude ?? []),
        onlyFiles: true,
    })

    return paths.filter(path => sourceExtensions.includes(Path.extname(path)))
}

export function isDeclarationFile(path: string): boolean {
    return declarationExtension.test(path)
}

export function importPath(fromFile: string, toFile: string, extension: "js" | "none"): string {
    const relative = Path.relative(Path.dirname(fromFile), Path.dirname(toFile))
    const dirPath = relative.startsWith("..") ? relative : `./${relative}`
    const extName = isDeclarationFile(toFile)
        ? toFile.match(declarationExtension)![0]
        : Path.extname(toFile)
    const fileName = Path.basename(toFile, extName)
    return [
        ...dirPath.split(Path.sep),
        `${fileName}${extension === "js" ? remapExtension(extName) : ""}`,
    ]
        .filter(Boolean)
        .join("/")
}

export function resolveRelative(specifier: string, fromFile: string): string | undefined {
    const path = Path.resolve(Path.dirname(fromFile), specifier)
    // Remove the extension so we can resolve eg. "foo.js" to "foo.ts".
    const stem = sourceExtensions.includes(Path.extname(path))
        ? path.slice(0, -Path.extname(path).length)
        : path
    for (const base of [stem, Path.join(path, "index")]) {
        for (const extension of sourceExtensions) {
            if (fileExists(base + extension)) return base + extension
        }
    }
    return undefined
}

function remapExtension(extName: string): string {
    if (extName === ".ts") return ".js"
    if (extName === ".tsx") return ".jsx"
    if (extName === ".mts") return ".mjs"
    if (extName === ".d.ts") return ".js"
    if (extName === ".d.mts") return ".mjs"
    return extName
}

function fileExists(path: string): boolean {
    return statSync(path, { throwIfNoEntry: false })?.isFile() ?? false
}
