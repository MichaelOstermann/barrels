import { describe, expect, it } from "vitest"
import { Barrel } from "../../src"

describe("Barrel.defaultImport", () => {
    it("should create a default import", () => {
        expect(Barrel.defaultImport({
            alias: "alias",
            path: "path",
        })).toBe(`import alias from "path";`)
    })

    it("should create a default type import", () => {
        expect(Barrel.defaultImport({
            alias: "alias",
            path: "path",
            type: true,
        })).toBe(`import type alias from "path";`)
    })

    it("should return an empty string if path or alias is empty", () => {
        expect(Barrel.defaultImport({ alias: "alias", path: "" })).toBe("")
        expect(Barrel.defaultImport({ alias: "", path: "path" })).toBe("")
    })
})
