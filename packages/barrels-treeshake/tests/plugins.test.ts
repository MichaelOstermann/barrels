import type { TreeShakeImportResolver } from "../src"
import Path from "node:path"
import { describe, expect, it } from "bun:test"
import { rolldown } from "rolldown"
import { transform, treeshake } from "../src"

const entry = Path.join(import.meta.dirname, "__fixtures__/entry.ts")

const resolve: TreeShakeImportResolver = function ({ importAlias, importPath, propertyName }) {
    if (importPath !== "./lib") return
    return `import { ${propertyName} as ${importAlias} } from "./lib/${propertyName}";`
}

describe("treeshake", () => {
    it("should skip files that are excluded or not included", () => {
        const code = `import { Foo } from "./lib";\nFoo.bar;`
        const plugin = treeshake({ exclude: /skipped/, resolve: () => `import _bar from "bar";` })
        expect(plugin.transform.handler(code, "/a/b.ts")?.code).toBe(`import _bar from "bar";\n_bar;`)
        expect(plugin.transform.handler(code, "/a/skipped.ts")).toBe(undefined)
        expect(plugin.transform.handler(code, "/a/b.css")).toBe(undefined)
    })

    it("should work with rolldown", async () => {
        const bundle = await rolldown({ input: entry, plugins: [treeshake({ resolve })], treeshake: false })
        const { output } = await bundle.generate({ format: "esm" })
        expect(output[0].code).toContain(`"bar"`)
        expect(output[0].code).not.toContain("unused")
    })
})

describe("transform", () => {
    it("should work in an onLoad of Bun.build", async () => {
        const result = await Bun.build({
            entrypoints: [entry],
            plugins: [{
                name: "transforms",
                setup(build) {
                    build.onLoad({ filter: /\.tsx?$/ }, async ({ loader, path }) => {
                        const code = await Bun.file(path).text()
                        return { contents: transform(code, path, { resolve })?.code ?? code, loader }
                    })
                },
            }],
        })
        const code = await result.outputs[0]!.text()
        expect(code).toContain(`"bar"`)
        expect(code).not.toContain("unused")
    })
})
