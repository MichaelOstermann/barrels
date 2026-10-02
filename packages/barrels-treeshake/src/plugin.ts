import type { TreeShakeImportsOptions } from "./types"
import { transform } from "./transform"

export interface TreeShakePluginOptions extends Omit<TreeShakeImportsOptions, "debug"> {
    /** Prints what is being resolved and replaced, optionally only for files whose path matches. */
    debug?: boolean | RegExp
    enforce?: "post" | "pre"
    /** Skip files whose path matches one of these. */
    exclude?: RegExp | RegExp[]
    /**
     * Only transform files whose path matches one of these.
     * @default /\.[jt]sx?$/
     */
    include?: RegExp | RegExp[]
}

export interface TreeShakePlugin {
    enforce?: "post" | "pre"
    name: string
    transform: {
        filter: { id: { exclude: RegExp[], include: RegExp[] } }
        handler: (code: string, id: string) => ReturnType<typeof transform>
    }
}

/** A plugin for Vite, Rolldown and tsdown. */
export function treeshake({ debug, enforce, exclude = [], include = /\.[jt]sx?$/, resolve }: TreeShakePluginOptions): TreeShakePlugin {
    const id = {
        exclude: [exclude].flat(),
        include: [include].flat(),
    }

    return {
        enforce,
        name: "barrels-treeshake",
        transform: {
            filter: { id },
            handler(code, path) {
                // Bundlers that do not know hook filters call the handler for every file.
                if (id.exclude.some(pattern => pattern.test(path))) return
                if (!id.include.some(pattern => pattern.test(path))) return
                return transform(code, path, {
                    debug: debug instanceof RegExp ? debug.test(path) : debug,
                    resolve,
                })
            },
        },
    }
}
