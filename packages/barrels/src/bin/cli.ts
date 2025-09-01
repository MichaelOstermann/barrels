import type { BarrelsOutput } from "../types"
import { readFileSync } from "node:fs"
import { readFile } from "node:fs/promises"
import Path from "node:path"
import { newQueue } from "@henrygd/queue"
import chokidar from "chokidar"
import { cli, define } from "gunshi"
import ignore from "ignore"
import pc from "picocolors"
import { loadConfig } from "unconfig"
import { Barrel } from "../Barrel"

const { version } = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url)).toString(),
)

const runCommand = define({
    name: "run",
    args: {
        config: {
            description: "Use the specified config file (default: barrels.config.*, barrels.*)",
            short: "c",
            type: "string",
        },
        watch: {
            default: false,
            description: "Keep barrels up-to-date",
            short: "w",
            type: "boolean",
        },
    },
    run: async (ctx) => {
        let config = await loadBarrelsConfig(ctx.values.config)
        const gitignore = await getGitIgnore()

        const queue = newQueue(1)
        let output = await queue.add(config.exec)
        printOutput(output)

        if (ctx.values.watch) {
            watch(gitignore, async (path: string) => {
                if (path === config.path) {
                    // eslint-disable-next-line no-console
                    console.log(pc.yellow(`Config changed: ${path}`))
                    config = await loadBarrelsConfig(path)
                    queue.clear()
                    output = await queue.add(config.exec)
                    printOutput(output)
                }

                if (Barrel.isWatching(output, path) && queue.size() < 2) {
                    // eslint-disable-next-line no-console
                    console.log(pc.yellow(`File changed: ${path}`))
                    output = await queue.add(config.exec)
                    printOutput(output)
                }
            })
        }
    },
})

async function loadBarrelsConfig(path: string | undefined): Promise<{
    path: string
    exec: () => Promise<BarrelsOutput>
}> {
    const { config, sources: [source] } = await loadConfig<() => Promise<BarrelsOutput>>({
        merge: false,
        sources: [
            {
                files: path || "",
            },
            {
                extensions: ["ts", "mts", "cts", "js", "mjs", "cjs"],
                files: ["barrels.config", "barrels"],
            },
        ],
    })

    if (!source) {
        // eslint-disable-next-line no-console
        console.log(pc.red("No barrels configuration found"))
        process.exit(1)
    }

    return {
        exec: config,
        path: source,
    }
}

async function getGitIgnore(): Promise<ignore.Ignore> {
    const gitignorePath = Path.resolve(".gitignore")
    const gitignoreContents = await readFile(gitignorePath, "utf8").catch(() => "")
    return ignore().add(gitignoreContents.split("\n"))
}

function printOutput({ barrels }: BarrelsOutput): void {
    const c = barrels.length

    if (!c) {
        // eslint-disable-next-line no-console
        console.log(pc.green("No barrels generated"))
        return
    }

    for (const { barrel, path } of barrels) {
        const lines = barrel.trim().split("\n")
        const maxLen = lines.reduce((acc, line) => Math.max(acc, line.length), path.length)
        const header = `╭─${pc.blue(path)}${"─".repeat(maxLen - path.length)}─╮`
        const footer = `╰─${"─".repeat(maxLen)}─╯`
        const body = lines.map((line) => {
            const padding = " ".repeat(maxLen - line.length)
            return `│ ${line}${padding} │`
        })
        // eslint-disable-next-line no-console
        console.log([header, ...body, footer].join("\n"))
    }

    // eslint-disable-next-line no-console
    console.log(pc.green(`Generated ${c} ${c > 1 ? "barrels" : "barrel"}`))
}

function watch(gitignore: ignore.Ignore, onFileEvent: (path: string) => void): void {
    chokidar
        .watch(".", {
            ignoreInitial: true,
            ignored: (path) => {
                if (path === ".") return false
                if (path.includes(".git/")) return true
                if (path.includes("node_modules/")) return true
                if (gitignore.ignores(path)) return true
                return false
            },
        })
        .on("all", (_event, path) => {
            onFileEvent(Path.resolve(path))
        })
}

cli(process.argv.slice(2), runCommand, {
    name: "barrels",
    version,
})
