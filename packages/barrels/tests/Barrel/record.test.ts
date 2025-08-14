import { describe, expect, it } from "vitest"
import { Barrel, Source } from "../../src"

describe("Barrel.flat", () => {
    it("should create a record barrel", async () => {
        const sources = [
            await Source.file("./packages/barrels/tests/__fixtures__/exports.ts"),

            await Source.default("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "Foo", type: true }),

            await Source.default("./packages/barrels/tests/__fixtures__/exports.ts"),
            await Source.default("./packages/barrels/tests/__fixtures__/exports.ts", { type: true }),
            await Source.default("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "A" }),
            await Source.default("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "B", type: true }),

            await Source.named("C", "./packages/barrels/tests/__fixtures__/exports.ts"),
            await Source.named("D", "./packages/barrels/tests/__fixtures__/exports.ts", { type: true }),
            await Source.named("E", "./packages/barrels/tests/__fixtures__/exports.ts", { alias: "F" }),
            await Source.named("G", "./packages/barrels/tests/__fixtures__/exports.ts", { alias: "H", type: true }),

            await Source.wildcard("./packages/barrels/tests/__fixtures__/exports.ts"),
            await Source.wildcard("./packages/barrels/tests/__fixtures__/exports.ts", { type: true }),
            await Source.wildcard("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "I" }),
            await Source.wildcard("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "J", type: true }),
        ]
        expect(Barrel.record(sources as Source[], { name: "Foo" })).toMatchSnapshot()
    })
})
