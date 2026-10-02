import Path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
    resolve: {
        alias: {
            "@monstermann/barrels": Path.resolve(import.meta.dirname, "./packages/barrels/src/index.ts"),
        },
    },
})
