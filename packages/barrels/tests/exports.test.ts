import Path from "node:path"
import { describe, expect, it } from "bun:test"
import { readExports } from "../src/internals/exports"

const fixture = (path: string): string => Path.join(import.meta.dirname, "__fixtures__", path)

describe("readExports", () => {
    it("should read exported declarations", async () => {
        expect(await readExports(fixture("Shape/area.ts"))).toEqual([
            { isType: false, name: "area" },
        ])
    })

    it("should read export specifiers, their aliases and skip default exports", async () => {
        expect(await readExports(fixture("Shape/create.ts"))).toEqual([
            { isType: false, name: "create" },
            { isType: false, name: "zero" },
        ])
    })

    it("should detect types", async () => {
        expect(await readExports(fixture("Shape/types.ts"))).toEqual([
            { isType: true, name: "Shape" },
            { isType: true, name: "ShapeOptions" },
        ])
    })

    it("should follow relative wildcard exports and skip the ones from packages", async () => {
        expect(await readExports(fixture("Shape/reexports.ts"))).toEqual([
            { isType: true, name: "Unit" },
            { isType: false, name: "defaultUnit" },
            { isType: false, name: "Units" },
        ])
    })
})
