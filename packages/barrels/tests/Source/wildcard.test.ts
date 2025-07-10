import { describe, expect, it } from "vitest"
import { Source } from "../../src"

describe("Source.wildcard", () => {
    it("should create a wildcard import source", () => {
        expect(Source.wildcard("./packages/barrels/tests/__fixtures__/exports.ts")).toMatchSnapshot()
    })

    it("should create a type wildcard import source", () => {
        expect(Source.wildcard("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "foo" })).toMatchSnapshot()
    })

    it("should create a wildcard import source with alias", () => {
        expect(Source.wildcard("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "foo" })).toMatchSnapshot()
    })

    it("should create a type wildcard import source with alias", () => {
        expect(Source.wildcard("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "foo", type: true })).toMatchSnapshot()
    })
})
