import { describe, expect, it } from "vitest"
import { Barrel } from "../../src"

describe("Barrel.namedExport", () => {
    it("should create a named export", () => {
        expect(Barrel.namedExport({
            name: "name",
            path: "path",
        })).toBe(`export { name } from "path";`)
    })

    it("should create an aliased named export", () => {
        expect(Barrel.namedExport({
            alias: "alias",
            name: "name",
            path: "path",
        })).toBe(`export { name as alias } from "path";`)
    })

    it("should create a named type export", () => {
        expect(Barrel.namedExport({
            name: "name",
            path: "path",
            type: true,
        })).toBe(`export type { name } from "path";`)
    })

    it("should create an aliased named type export", () => {
        expect(Barrel.namedExport({
            alias: "alias",
            name: "name",
            path: "path",
            type: true,
        })).toBe(`export type { name as alias } from "path";`)
    })

    it("should return an empty string if path or name is empty", () => {
        expect(Barrel.namedExport({ name: "name", path: "" })).toBe("")
        expect(Barrel.namedExport({ name: "", path: "path" })).toBe("")
    })
})
