import { describe, expect, it } from "vitest"
import { Source } from "../../src"

describe("Source.walkAst", () => {
    it("should walk through ast", async () => {
        const file = await Source.file("./packages/barrels/tests/__fixtures__/exports.ts")
        const enterNodes: any[] = []
        const exitNodes: any[] = []
        await Source.walkAst(file!, {
            async enter(node) {
                enterNodes.push(node)
            },
            async leave(node) {
                exitNodes.push(node)
            },
        })
        expect({ enterNodes, exitNodes }).toMatchSnapshot()
    })
})
