import { describe, expect, it } from "vitest"
import { Source } from "../../src"

describe("Source.exports", () => {
    it("should retrieve exports from local module", async () => {
        const file = await Source.file("./packages/barrels/tests/__fixtures__/exports.ts")
        const exports = await Source.exports(file!)
        expect(exports).toMatchSnapshot()
    })

    it("should retrieve exports from external module", async () => {
        const file = await Source.file("tsconfck")
        const exports = await Source.exports(file!)
        expect(exports).toMatchSnapshot()
    })
})
