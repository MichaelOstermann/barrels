import { describe, expect, it } from "vitest"
import { Barrel } from "../../src"

describe("Barrel.wildcardImport", () => {
    it("should create a wildcard import", () => {
        expect(Barrel.wildcardImport({
            alias: "alias",
            path: "path",
        })).toBe(`import * as alias from "path";`)
    })

    it("should create a wildcard type import", () => {
        expect(Barrel.wildcardImport({
            alias: "alias",
            path: "path",
            type: true,
        })).toBe(`import type * as alias from "path";`)
    })

    it("should return an empty string if path or alias is empty", () => {
        expect(Barrel.wildcardImport({ alias: "alias", path: "" })).toBe("")
        expect(Barrel.wildcardImport({ alias: "", path: "path" })).toBe("")
    })
})
