import type { BarrelsOutput } from "./types"
import { AsyncLocalStorage } from "node:async_hooks"

const storage = new AsyncLocalStorage<BarrelsOutput>()

export function defineConfig(
    configs: (() => Promise<unknown>)[],
): () => Promise<BarrelsOutput> {
    return () => runConfig(async () => {
        for (const config of configs) {
            await config()
        }
    })
}

export function getBarrelsOutput(): BarrelsOutput | undefined {
    return storage.getStore()
}

async function runConfig(fn: () => unknown): Promise<BarrelsOutput> {
    const ctx = getBarrelsOutput() ?? {
        barrels: [],
        watchedPatterns: new Map(),
    }
    await storage.run(ctx, fn)
    return ctx
}
