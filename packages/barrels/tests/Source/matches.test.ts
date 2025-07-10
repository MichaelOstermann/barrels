import { describe, expect, it } from "vitest"
import { Source } from "../../src"

describe("Source.matches", () => {
    it("should pattern match file paths", async () => {
        const file = await Source.file("./packages/barrels/tests/__fixtures__/exports.ts")
        expect(Source.matches(file!, "**/tests/**")).toBe(true)
    })
})
