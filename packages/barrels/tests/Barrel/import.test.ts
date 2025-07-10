import { describe, expect, it } from "vitest"
import { Barrel, Source } from "../../src"

describe("Barrel.import", () => {
    it("should create appropiate imports for all sources", async () => {
        const barrel = [
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
            .map(source => Barrel.import(source!))
            .join("\n")
        expect(barrel).toMatchSnapshot()
    })
})
