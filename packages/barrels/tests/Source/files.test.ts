import { describe, expect, it } from "vitest"
import { Source } from "../../src"

describe("Source.files", () => {
    it("should return file sources based on globs", async () => {
        const files = await Source.files("./packages/barrels/src/*.ts")
        expect(files).toMatchSnapshot()
    })

    it("should return file sources based on globs (2)", async () => {
        const files = await Source.files("packages/barrels/src/*.ts")
        expect(files).toMatchSnapshot()
    })

    it("should return file sources based on file paths", async () => {
        const files = await Source.files([
            "./packages/barrels/tests/__fixtures__/exports.ts",
            "packages/barrels/tests/__fixtures__/wildcard.ts",
        ])
        expect(files).toMatchSnapshot()
    })
})
