import { describe, expect, it } from "vitest"
import { Barrel, Source } from "../../src"

describe("Barrel.flat", () => {
    it("should create a flat barrel", async () => {
        const sources = [
            await Source.file("./packages/barrels/tests/__fixtures__/exports.ts"),

            await Source.default("./packages/barrels/tests/__fixtures__/exports.ts"),
            await Source.default("./packages/barrels/tests/__fixtures__/exports.ts", { type: true }),
            await Source.default("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "foo" }),
            await Source.default("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "foo", type: true }),

            await Source.named("foo", "./packages/barrels/tests/__fixtures__/exports.ts"),
            await Source.named("foo", "./packages/barrels/tests/__fixtures__/exports.ts", { type: true }),
            await Source.named("foo", "./packages/barrels/tests/__fixtures__/exports.ts", { alias: "bar" }),
            await Source.named("foo", "./packages/barrels/tests/__fixtures__/exports.ts", { alias: "bar", type: true }),

            await Source.wildcard("./packages/barrels/tests/__fixtures__/exports.ts"),
            await Source.wildcard("./packages/barrels/tests/__fixtures__/exports.ts", { type: true }),
            await Source.wildcard("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "foo" }),
            await Source.wildcard("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "foo", type: true }),
        ]
        expect(Barrel.flat(sources as Source[])).toMatchSnapshot()
    })
})
