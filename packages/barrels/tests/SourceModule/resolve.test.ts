import { describe, expect, it } from "vitest"
import { SourceModule } from "../../src"

describe("SourceModule.resolve", () => {
    it("should resolve local modules", async () => {
        const module = await SourceModule.resolve("./packages/barrels/tests/__fixtures__/exports.ts")
        expect(module).toMatchSnapshot()
    })

    it("should resolve relative local modules", async () => {
        const a = await SourceModule.resolve("./packages/barrels/tests/__fixtures__/exports.ts")
        const b = await SourceModule.resolve("./exports.ts", a!.filePath)
        expect(b).toMatchSnapshot()
    })

    it("should resolve external modules", async () => {
        const module = await SourceModule.resolve("tsconfck")
        expect(module).toMatchSnapshot()
    })

    it("should resolve relative external modules", async () => {
        const a = await SourceModule.resolve("tsconfck")
        const b = await SourceModule.resolve("./find.js", a!.filePath)
        expect(b).toMatchSnapshot()
    })

    it("should resolve tsconfig aliases", async () => {
        const a = await SourceModule.resolve("./packages/barrels/tests/__fixtures__/exports.ts")
        const b = await SourceModule.resolve("#exports", a!.filePath)
        expect(b).toMatchSnapshot()
    })

    it("should not resolve built-in modules", async () => {
        const module = await SourceModule.resolve("node:path")
        expect(module).toMatchSnapshot()
    })
})
