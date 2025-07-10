import { describe, expect, it } from "vitest"
import { Source } from "../../src"

describe("Source.removeExtension", () => {
    it("should remove extensions from local modules", async () => {
        const file = await Source.file("./packages/barrels/tests/__fixtures__/exports.ts")
        expect(Source.removeExtension(file!).extName).toBe("")
    })

    it("should not remove extensions from external modules", async () => {
        const file = await Source.file("tsconfck")
        expect(Source.removeExtension(file!).extName).toBe("js")
    })
})
