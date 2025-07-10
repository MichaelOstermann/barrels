import { describe, expect, it } from "vitest"
import { SourceModule } from "../../src"

describe("SourceModule.matches", () => {
    it("should pattern match against the file path", async () => {
        const module = await SourceModule.resolve("./packages/barrels/tests/__fixtures__/exports.ts")
        expect(SourceModule.matches(module!, "**/tests/**")).toBe(true)
    })
})
