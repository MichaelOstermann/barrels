import type { TransformPlugin } from "./plugin"
import { readFile } from "node:fs/promises"
import { matchesFilter } from "./plugin"

interface BunPlugin {
    name: string
    setup: (build: {
        onLoad: (
            constraints: { filter: RegExp },
            callback: (args: { path: string }) => Promise<{ contents: string, loader: "js" | "jsx" | "ts" | "tsx" } | undefined>,
        ) => unknown
    }) => void
}

/**
 * Runs a list of plugins with `Bun.build`, in the given order.
 * Bun only uses the first `onLoad` that returns something, so they have to share a single one.
 */
export function bun(plugins: TransformPlugin[]): BunPlugin {
    return {
        name: plugins.map(plugin => plugin.name).join(", "),
        setup(build) {
            build.onLoad({ filter: /\.[cm]?[jt]sx?$/ }, async ({ path }) => {
                const matching = plugins.filter(plugin => matchesFilter(plugin, path))
                if (!matching.length) return

                const source = await readFile(path, "utf8")
                let code = source

                for (const plugin of matching) {
                    code = plugin.transform.handler(code, path)?.code ?? code
                }

                if (code === source) return

                const extension = path.slice(path.lastIndexOf(".") + 1).replace(/^[cm]/, "")
                return { contents: code, loader: extension as "js" | "jsx" | "ts" | "tsx" }
            })
        },
    }
}
