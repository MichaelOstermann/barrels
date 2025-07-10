import { describe, expect, it } from "vitest"
import { SourceModule } from "../../src"

describe("SourceModule.walkAst", () => {
    it("should walk through ast", async () => {
        const module = await SourceModule.resolve("./packages/barrels/tests/__fixtures__/exports.ts")
        const enterNodes: any[] = []
        const exitNodes: any[] = []
        await SourceModule.walkAst(module!, {
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
