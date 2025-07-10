import { describe, expect, it } from "vitest"
import { Barrel } from "../../src"

describe("Barrel.namedImport", () => {
    it("should create a named import", () => {
        expect(Barrel.namedImport({
            name: "name",
            path: "path",
        })).toBe(`import { name } from "path";`)
    })

    it("should create an aliased named import", () => {
        expect(Barrel.namedImport({
            alias: "alias",
            name: "name",
            path: "path",
        })).toBe(`import { name as alias } from "path";`)
    })

    it("should create a named type import", () => {
        expect(Barrel.namedImport({
            name: "name",
            path: "path",
            type: true,
        })).toBe(`import type { name } from "path";`)
    })

    it("should create an aliased named type import", () => {
        expect(Barrel.namedImport({
            alias: "alias",
            name: "name",
            path: "path",
            type: true,
        })).toBe(`import type { name as alias } from "path";`)
    })

    it("should return an empty string if path or name is empty", () => {
        expect(Barrel.namedImport({ name: "name", path: "" })).toBe("")
        expect(Barrel.namedImport({ name: "", path: "path" })).toBe("")
    })
})
