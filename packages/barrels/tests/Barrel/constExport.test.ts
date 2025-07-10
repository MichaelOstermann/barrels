import { describe, expect, it } from "vitest"
import { Barrel } from "../../src"

describe("Barrel.constExport", () => {
    it("should create a const export", () => {
        expect(Barrel.constExport({
            name: "name",
            value: "value",
        })).toBe("export const name = value;")
    })

    it("should create a type export", () => {
        expect(Barrel.constExport({
            name: "name",
            type: true,
            value: "value",
        })).toBe("export type name = value;")
    })

    it("should return an empty string if name or value is empty", () => {
        expect(Barrel.constExport({ name: "", value: "value" })).toBe("")
        expect(Barrel.constExport({ name: "name", value: "" })).toBe("")
    })
})
