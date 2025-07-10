import { describe, expect, it } from "vitest"
import { Barrel, Source } from "../../src"

describe("Barrel.namespace", () => {
    it("should create a namespace barrel with merged types", async () => {
        const sources = [
            await Source.file("./packages/barrels/tests/__fixtures__/exports.ts"),

            await Source.default("./packages/barrels/tests/__fixtures__/exports.ts"),
            await Source.default("./packages/barrels/tests/__fixtures__/exports.ts", { type: true }),
            await Source.default("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "foo" }),
            await Source.default("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "foo", type: true }),

            await Source.named("foo", "./packages/barrels/tests/__fixtures__/exports.ts"),
            await Source.named("foo", "./packages/barrels/tests/__fixtures__/exports.ts", { type: true }),
            await Source.named("foo", "./packages/barrels/tests/__fixtures__/exports.ts", { alias: "bar" }),
            await Source.named("foo", "./packages/barrels/tests/__fixtures__/exports.ts", { alias: "Foo", type: true }),

            await Source.wildcard("./packages/barrels/tests/__fixtures__/exports.ts"),
            await Source.wildcard("./packages/barrels/tests/__fixtures__/exports.ts", { type: true }),
            await Source.wildcard("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "foo" }),
            await Source.wildcard("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "foo", type: true }),
        ]
        expect(Barrel.namespace(
            sources as Source[],
            { name: "Foo", types: "merge" },
        )).toMatchSnapshot()
    })

    it("should create a namespace barrel with nested types", async () => {
        const sources = [
            await Source.file("./packages/barrels/tests/__fixtures__/exports.ts"),

            await Source.default("./packages/barrels/tests/__fixtures__/exports.ts"),
            await Source.default("./packages/barrels/tests/__fixtures__/exports.ts", { type: true }),
            await Source.default("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "foo" }),
            await Source.default("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "foo", type: true }),

            await Source.named("foo", "./packages/barrels/tests/__fixtures__/exports.ts"),
            await Source.named("foo", "./packages/barrels/tests/__fixtures__/exports.ts", { type: true }),
            await Source.named("foo", "./packages/barrels/tests/__fixtures__/exports.ts", { alias: "bar" }),
            await Source.named("foo", "./packages/barrels/tests/__fixtures__/exports.ts", { alias: "Foo", type: true }),

            await Source.wildcard("./packages/barrels/tests/__fixtures__/exports.ts"),
            await Source.wildcard("./packages/barrels/tests/__fixtures__/exports.ts", { type: true }),
            await Source.wildcard("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "foo" }),
            await Source.wildcard("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "foo", type: true }),
        ]
        expect(Barrel.namespace(
            sources as Source[],
            { name: "Foo", types: "nested" },
        )).toMatchSnapshot()
    })

    it("should create a namespace barrel with flat types", async () => {
        const sources = [
            await Source.file("./packages/barrels/tests/__fixtures__/exports.ts"),

            await Source.default("./packages/barrels/tests/__fixtures__/exports.ts"),
            await Source.default("./packages/barrels/tests/__fixtures__/exports.ts", { type: true }),
            await Source.default("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "foo" }),
            await Source.default("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "foo", type: true }),

            await Source.named("foo", "./packages/barrels/tests/__fixtures__/exports.ts"),
            await Source.named("foo", "./packages/barrels/tests/__fixtures__/exports.ts", { type: true }),
            await Source.named("foo", "./packages/barrels/tests/__fixtures__/exports.ts", { alias: "bar" }),
            await Source.named("foo", "./packages/barrels/tests/__fixtures__/exports.ts", { alias: "Foo", type: true }),

            await Source.wildcard("./packages/barrels/tests/__fixtures__/exports.ts"),
            await Source.wildcard("./packages/barrels/tests/__fixtures__/exports.ts", { type: true }),
            await Source.wildcard("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "foo" }),
            await Source.wildcard("./packages/barrels/tests/__fixtures__/exports.ts", { alias: "foo", type: true }),
        ]
        expect(Barrel.namespace(
            sources as Source[],
            { name: "Foo", types: "flat" },
        )).toMatchSnapshot()
    })
})
