import { describe, expect, it } from "vitest"
import { Source } from "../../src"

describe("Source.importPath", () => {
    it("should return the correct import path for local modules", async () => {
        const fileA = await Source.file("./packages/barrels/tests/__fixtures__/exports.ts")
        const fileB = Source.importFrom(fileA!, "./packages/barrels/tests/index.ts")
        expect(Source.importPath(fileB)).toBe("./__fixtures__/exports.ts")
    })

    it("should return the correct import path for local modules with modified extensions", async () => {
        const fileA = await Source.file("./packages/barrels/tests/__fixtures__/exports.ts")
        const fileB = Source.removeExtension(fileA!)
        const fileC = Source.importFrom(fileB, "./packages/barrels/tests/index.ts")
        expect(Source.importPath(fileC)).toBe("./__fixtures__/exports")
    })

    it("should return the correct import path for external modules", async () => {
        const file = await Source.file("tsconfck")
        expect(Source.importPath(file!)).toBe("tsconfck")
    })
})
