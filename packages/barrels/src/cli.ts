/* eslint-disable no-console */
import type { Barrel, BarrelConfig } from "./types"
import { existsSync, readFileSync } from "node:fs"
import Path from "node:path"
import { pathToFileURL } from "node:url"
import { parseArgs, styleText } from "node:util"
import { run } from "./run"

const configNames = ["barrels.config", "barrels"]
const configExtensions = ["ts", "mts", "cts", "js", "mjs", "cjs"]

const { values } = parseArgs({
    options: {
        config: { short: "c", type: "string" },
        help: { short: "h", type: "boolean" },
        version: { short: "v", type: "boolean" },
    },
})

if (values.help) {
    console.log([
        "Usage: barrels [options]",
        "",
        "Options:",
        "  -c, --config <path>  Use the specified config file (default: barrels.config.*, barrels.*)",
        "  -v, --version        Print the version",
        "  -h, --help           Print this message",
    ].join("\n"))
}

else if (values.version) {
    const { version } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"))
    console.log(version)
}

else {
    const configPath = findConfig(values.config)

    if (!configPath) {
        console.log(styleText("red", "No barrels configuration found"))
        process.exit(1)
    }

    const configs: BarrelConfig[] = (await import(pathToFileURL(configPath).href)).default
    printBarrels(await run(configs))
}

function findConfig(path: string | undefined): string | undefined {
    if (path) return existsSync(path) ? Path.resolve(path) : undefined
    return configNames
        .flatMap(name => configExtensions.map(extension => Path.resolve(`${name}.${extension}`)))
        .find(path => existsSync(path))
}

function printBarrels(barrels: Barrel[]): void {
    const c = barrels.length

    if (!c) {
        console.log(styleText("green", "No barrels generated"))
        return
    }

    for (const { contents, path } of barrels) {
        const lines = contents.trim().split("\n")
        const maxLen = lines.reduce((acc, line) => Math.max(acc, line.length), path.length)
        const header = `╭─${styleText("blue", path)}${"─".repeat(maxLen - path.length)}─╮`
        const footer = `╰─${"─".repeat(maxLen)}─╯`
        const body = lines.map((line) => {
            const padding = " ".repeat(maxLen - line.length)
            return `│ ${line}${padding} │`
        })
        console.log([header, ...body, footer].join("\n"))
    }

    console.log(styleText("green", `Generated ${c} ${c > 1 ? "barrels" : "barrel"}`))
}
