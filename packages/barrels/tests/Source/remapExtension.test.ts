import { describe, expect, it } from "vitest"
import { Source } from "../../src"

describe("Source.remapExtension", () => {
    it("should remap mapped matched extensions", async () => {
        const file = await Source.file("./packages/barrels/tests/__fixtures__/exports.ts")
        expect(Source.remapExtension(file!, { ts: "js" }).extName).toBe("js")
    })

    it("should not remap external modules", async () => {
        const file = await Source.file("tsconfck")
        expect(Source.remapExtension(file!, { js: "" }).extName).toBe("js")
    })

    it("should keep unmatched extensions", async () => {
        const file = await Source.file("./packages/barrels/tests/__fixtures__/exports.ts")
        expect(Source.remapExtension(file!, { mts: "mjs" }).extName).toBe("ts")
    })
})
