import { describe, expect, it } from "vitest"
import { Barrel } from "../../src"

describe("Barrel.defaultExport", () => {
    it("should create a default export", () => {
        expect(Barrel.defaultExport({
            path: "path",
        })).toBe(`export { default } from "path";`)
    })

    it("should create an aliased default export", () => {
        expect(Barrel.defaultExport({
            alias: "alias",
            path: "path",
        })).toBe(`export { default as alias } from "path";`)
    })

    it("should create a default type export", () => {
        expect(Barrel.defaultExport({
            path: "path",
            type: true,
        })).toBe(`export type { default } from "path";`)
    })

    it("should create an aliased default type export", () => {
        expect(Barrel.defaultExport({
            alias: "alias",
            path: "path",
            type: true,
        })).toBe(`export type { default as alias } from "path";`)
    })

    it("should return an empty string if path is empty", () => {
        expect(Barrel.defaultExport({ path: "" })).toBe("")
    })
})
