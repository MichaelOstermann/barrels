import { defineConfig } from "tsdown"

export default [
    defineConfig({
        entry: ["./src/index.ts"],
        unbundle: true,
    }),
    defineConfig({
        dts: false,
        entry: ["./src/bin/cli.ts"],
        unbundle: true,
        outputOptions: {
            banner: "#!/usr/bin/env node",
        },
    }),
]
