import { describe, expect, it } from "vitest"
import { Source } from "../../src"

describe("Source.default", () => {
    it("should create a default import source", () => {
        expect(Source.default("./packages/barrels/tests/__fixtures__/exports.ts")).toMatchSnapshot()
    })

    it("should create a type default import source", () => {
        expect(Source.default("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "foo" })).toMatchSnapshot()
    })

    it("should create a default import source with alias", () => {
        expect(Source.default("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "foo" })).toMatchSnapshot()
    })

    it("should create a type default import source with alias", () => {
        expect(Source.default("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "foo", type: true })).toMatchSnapshot()
    })
})
