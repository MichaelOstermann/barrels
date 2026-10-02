import type { TreeShakeImportsOptions } from "./types"
import { transform } from "./transform"

export interface TransformFilter {
    /** Only transform files containing one of these, strings are matched as substrings. */
    code?: string | RegExp | (string | RegExp)[]
    /** Skip files whose path matches one of these. */
    exclude?: RegExp | RegExp[]
    /** Only transform files whose path matches one of these. */
    include?: RegExp | RegExp[]
}

/**
 * A plugin for Vite, Rolldown and tsdown, reduced to a filtered `transform` hook.
 * Use `bun` to run a list of them with `Bun.build`.
 */
export interface TransformPlugin {
    enforce?: "post" | "pre"
    name: string
    transform: {
        filter: {
            code?: { include: (string | RegExp)[] }
            id: { exclude: RegExp[], include: RegExp[] }
        }
        handler: (code: string, id: string) => { code: string, map?: any } | null | undefined
    }
}

export interface TreeShakePluginOptions extends Omit<TreeShakeImportsOptions, "debug">, TransformFilter {
    /** Prints what is being resolved and replaced, optionally only for files whose path matches. */
    debug?: boolean | RegExp
    enforce?: "post" | "pre"
}

export function treeshake({ debug, enforce, resolve, ...filter }: TreeShakePluginOptions): TransformPlugin {
    return definePlugin({
        enforce,
        filter,
        name: "tree-shake-import-namespaces",
        transform(code, id) {
            return transform(code, id, {
                debug: debug instanceof RegExp ? debug.test(id) : debug,
                resolve,
            })
        },
    })
}

/** Creates a plugin from a `transform` function, by default it runs for `.js`, `.jsx`, `.ts` and `.tsx` files. */
export function definePlugin({ enforce, filter = {}, name, transform }: {
    enforce?: "post" | "pre"
    filter?: TransformFilter
    name: string
    transform: TransformPlugin["transform"]["handler"]
}): TransformPlugin {
    const plugin: TransformPlugin = {
        enforce,
        name,
        transform: {
            filter: {
                code: filter.code === undefined ? undefined : { include: [filter.code].flat() },
                id: {
                    exclude: [filter.exclude ?? []].flat(),
                    include: [filter.include ?? /\.[jt]sx?$/].flat(),
                },
            },
            // Bundlers that do not know hook filters call the handler for every file.
            handler: (code, id) => matchesFilter(plugin, id, code) ? transform(code, id) : undefined,
        },
    }
    return plugin
}

export function matchesFilter({ transform: { filter } }: TransformPlugin, id: string, code?: string): boolean {
    if (filter.id.exclude.some(pattern => pattern.test(id))) return false
    if (!filter.id.include.some(pattern => pattern.test(id))) return false
    if (code === undefined || !filter.code) return true
    return filter.code.include.some(pattern => typeof pattern === "string" ? code.includes(pattern) : pattern.test(code))
}
