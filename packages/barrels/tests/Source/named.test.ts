import { describe, expect, it } from "vitest"
import { Source } from "../../src"

describe("Source.named", () => {
    it("should create a named import source", () => {
        expect(Source.named("foo", "./packages/barrels/tests/__fixtures__/exports.ts")).toMatchSnapshot()
    })

    it("should create a type named import source", () => {
        expect(Source.named("foo", "./packages/barrels/tests/__fixtures__/exports.ts", { alias: "bar" })).toMatchSnapshot()
    })

    it("should create a named import source with alias", () => {
        expect(Source.named("foo", "./packages/barrels/tests/__fixtures__/exports.ts", { alias: "bar" })).toMatchSnapshot()
    })

    it("should create a type named import source with alias", () => {
        expect(Source.named("foo", "./packages/barrels/tests/__fixtures__/exports.ts", { alias: "bar", type: true })).toMatchSnapshot()
    })
})
