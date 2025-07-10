import { describe, expect, it } from "vitest"
import { SourceModule } from "../../src"

describe("SourceModule.exports", () => {
    it("should retrieve exports shallowly", async () => {
        const module = await SourceModule.resolve("./packages/barrels/tests/__fixtures__/exports.ts")
        const exports = await SourceModule.exports(module!, false)
        expect(exports).toMatchSnapshot()
    })

    it("should retrieve exports shallowly from wildcard re-export", async () => {
        const module = await SourceModule.resolve("./packages/barrels/tests/__fixtures__/wildcard.ts")
        const exports = await SourceModule.exports(module!, false)
        expect(exports).toMatchSnapshot()
    })

    it("should retrieve exports shallowly from external module", async () => {
        const module = await SourceModule.resolve("tsconfck")
        const exports = await SourceModule.exports(module!, false)
        expect(exports).toMatchSnapshot()
    })

    it("should retrieve exports deeply", async () => {
        const module = await SourceModule.resolve("./packages/barrels/tests/__fixtures__/exports.ts")
        const exports = await SourceModule.exports(module!, true)
        expect(exports).toMatchSnapshot()
    })

    it("should retrieve exports deeply from wildcard re-export", async () => {
        const module = await SourceModule.resolve("./packages/barrels/tests/__fixtures__/wildcard.ts")
        const exports = await SourceModule.exports(module!, true)
        expect(exports).toMatchSnapshot()
    })

    it("should retrieve exports deeply from external module", async () => {
        const module = await SourceModule.resolve("tsconfck")
        const exports = await SourceModule.exports(module!, true)
        expect(exports).toMatchSnapshot()
    })
})
