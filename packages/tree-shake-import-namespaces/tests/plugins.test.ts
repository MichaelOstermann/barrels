import Path from "node:path"
import { describe, expect, it } from "bun:test"
import { rolldown } from "rolldown"
import { bun, definePlugin, matchesFilter, treeshake } from "../src"

const entry = Path.join(import.meta.dirname, "__fixtures__/entry.ts")

const plugin = treeshake({
    code: "./lib",
    resolve({ importAlias, importPath, propertyName }) {
        if (importPath !== "./lib") return
        return `import { ${propertyName} as ${importAlias} } from "./lib/${propertyName}";`
    },
})

const marker = definePlugin({
    name: "marker",
    transform: code => ({ code: `${code}\nexport const marker = "marked";` }),
})

describe("matchesFilter", () => {
    it("should match ids and code", () => {
        expect(matchesFilter(plugin, "/a/b.ts")).toBe(true)
        expect(matchesFilter(plugin, "/a/b.tsx")).toBe(true)
        expect(matchesFilter(plugin, "/a/b.css")).toBe(false)
        expect(matchesFilter(plugin, "/a/b.ts", `import "./lib/index.js"`)).toBe(true)
        expect(matchesFilter(plugin, "/a/b.ts", `import "./other.js"`)).toBe(false)
        expect(matchesFilter(definePlugin({ filter: { exclude: /node_modules/ }, name: "", transform: () => null }), "/node_modules/b.ts")).toBe(false)
    })
})

describe("treeshake", () => {
    it("should work with rolldown", async () => {
        const bundle = await rolldown({ input: entry, plugins: [plugin, marker], treeshake: false })
        const { output } = await bundle.generate({ format: "esm" })
        const code = output[0].code
        expect(code).toContain(`"bar"`)
        expect(code).toContain(`"marked"`)
        expect(code).not.toContain("unused")
    })
})

describe("bun", () => {
    it("should run all plugins with Bun.build", async () => {
        const result = await Bun.build({ entrypoints: [entry], plugins: [bun([plugin, marker])] })
        const code = await result.outputs[0]!.text()
        expect(result.success).toBe(true)
        expect(code).toContain(`"bar"`)
        expect(code).toContain(`"marked"`)
        expect(code).not.toContain("unused")
    })
})
