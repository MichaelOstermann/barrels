import { describe, expect, it } from "vitest"
import { Barrel } from "../../src"

describe("Barrel.wildcardExport", () => {
    it("should create a wildcard export", () => {
        expect(Barrel.wildcardExport({
            path: "path",
        })).toBe(`export * from "path";`)
    })

    it("should create an aliased wildcard export", () => {
        expect(Barrel.wildcardExport({
            alias: "alias",
            path: "path",
        })).toBe(`export * as alias from "path";`)
    })

    it("should create a wildcard type export", () => {
        expect(Barrel.wildcardExport({
            path: "path",
            type: true,
        })).toBe(`export type * from "path";`)
    })

    it("should create an aliased wildcard type export", () => {
        expect(Barrel.wildcardExport({
            alias: "alias",
            path: "path",
            type: true,
        })).toBe(`export type * as alias from "path";`)
    })

    it("should return an empty string if path is empty", () => {
        expect(Barrel.wildcardExport({ path: "" })).toBe("")
    })
})
