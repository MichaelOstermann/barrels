import { describe, expect, it } from "vitest"
import { Barrel } from "../../src"

describe("Barrel.property", () => {
    it("it should create a key/value pair", () => {
        expect(Barrel.property({ key: "key", value: "value" })).toBe("key: value,")
    })

    it("it should create a key/value shorthand pair", () => {
        expect(Barrel.property({ key: "key", value: "key" })).toBe("key,")
    })

    it("it should return an empty string if key or value is empty", () => {
        expect(Barrel.property({ key: "key", value: "" })).toBe("")
        expect(Barrel.property({ key: "", value: "value" })).toBe("")
    })
})
