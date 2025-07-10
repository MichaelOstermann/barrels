import { describe, expect, it } from "vitest"
import { Source } from "../../src"

describe("Source.importFrom", () => {
    it("should update the import path to be relative to the given one", async () => {
        const a = await Source.file("./packages/barrels/tests/__fixtures__/exports.ts")
        const b = Source.importFrom(a!, "./packages/barrels/tests/index.ts")
        const c = Source.importFrom(b!, "./packages/barrels/index.ts")
        expect(c.dirPath).toBe("./tests/__fixtures__")
    })

    it("should not update external modules", async () => {
        const a = await Source.file("tsconfck")
        const b = Source.importFrom(a!, "foo")
        expect(b.dirPath).toBe(a!.dirPath)
    })
})
