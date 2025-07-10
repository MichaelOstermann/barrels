import { describe, expect, it } from "vitest"
import { Source } from "../../src"

describe("Source.setImportAlias", () => {
    it("should update import alias", async () => {
        const file = await Source.file("./packages/barrels/tests/__fixtures__/exports.ts")
        expect(Source.setImportAlias(file!, "foo").alias).toBe("foo")
    })
})
