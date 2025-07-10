import { describe, expect, it } from "vitest"
import { Source } from "../../src"

describe("Source.file", () => {
    it("should resolve relative relative paths", async () => {
        const file = await Source.file("./packages/barrels/tests/__fixtures__/exports.ts")
        expect(file).toMatchSnapshot()
    })

    it("should resolve relative relative paths (2)", async () => {
        const file = await Source.file("packages/barrels/tests/__fixtures__/exports.ts")
        expect(file).toMatchSnapshot()
    })

    it("should resolve absolute absolute paths", async () => {
        const file = await Source.file(`${process.cwd()}/packages/barrels/tests/__fixtures__/exports.ts`)
        expect(file).toMatchSnapshot()
    })

    it("should resolve external modules", async () => {
        const file = await Source.file("tsconfck")
        expect(file).toMatchSnapshot()
    })

    it("should not resolve built-in modules", async () => {
        const file = await Source.file("node:path")
        expect(file).toMatchSnapshot()
    })
})
