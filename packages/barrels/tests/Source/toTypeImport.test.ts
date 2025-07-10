import { describe, expect, it } from "vitest"
import { Source } from "../../src"

describe("Source.toTypeImport", () => {
    it("should configure as type import", async () => {
        const file = await Source.file("./packages/barrels/tests/__fixtures__/exports.ts")
        expect(Source.toTypeImport(file!).isType).toBe(true)
    })
})
