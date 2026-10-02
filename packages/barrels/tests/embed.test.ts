import Path from "node:path"
import { beforeAll, describe, expect, it } from "bun:test"
import { embed } from "../src/internals/embed"

const fixturePath = Path.join(import.meta.dirname, "__fixtures__/embed/Fixture.ts")
const barrelPath = Path.join(import.meta.dirname, "__fixtures__/embed/index.d.ts")

let imports: string[]

beforeAll(async () => {
    imports = (await embed(fixturePath, barrelPath)).imports.map(({ code }) => code)
})

describe("embed", () => {
    it("should keep named imports", () => {
        expect(imports).toContain(`import { Node } from "oxc-parser";`)
    })

    it("should keep aliases of named imports", () => {
        expect(imports).toContain(`import { ParseResult as Parsed } from "oxc-parser";`)
        expect(imports).toContain(`import { GlobOptions as Aliased } from "tinyglobby";`)
    })

    it("should keep aliases of relative named imports", () => {
        expect(imports).toContain(`import { Thing as Renamed } from "./source.js";`)
    })

    it("should keep default imports", () => {
        expect(imports).toContain(`import Local from "./source.js";`)
    })

    it("should keep namespace imports", () => {
        expect(imports).toContain(`import * as Namespace from "./source.js";`)
    })

    it("should keep imports of builtin modules", () => {
        expect(imports).toContain(`import { ParsedPath } from "node:path";`)
    })

    it("should embed the declarations", async () => {
        const { contents, names } = await embed(fixturePath, barrelPath)
        expect(names).toEqual(new Set(["Fixture"]))
        expect(contents).toHaveLength(1)
        expect(contents[0]).toStartWith("interface Fixture {")
    })
})
