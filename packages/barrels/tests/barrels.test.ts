import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import Path from "node:path"
import { describe, expect, it } from "bun:test"
import { flat, namespace, run } from "../src"

const fixtures = Path.join(import.meta.dirname, "__fixtures__")

describe("namespace", () => {
    it("should create a namespace and its declaration", async () => {
        const [declaration, barrel] = await namespace({ entries: Path.join(fixtures, "Shape") })()
        expect(declaration!.path).toBe(Path.join(fixtures, "Shape/index.d.ts"))
        expect(declaration!.contents).toMatchSnapshot()
        expect(barrel!.path).toBe(Path.join(fixtures, "Shape/index.js"))
        expect(barrel!.contents).toMatchSnapshot()
    })

    it("should exclude globs relative to the entry and regular expressions", async () => {
        const [, barrel] = await namespace({
            entries: Path.join(fixtures, "Shape"),
            exclude: ["create.ts", /reexports/],
        })()
        expect(barrel!.contents).not.toContain("create")
        expect(barrel!.contents).not.toContain("Units")
        expect(barrel!.contents).toContain("area")
    })
})

describe("flat", () => {
    it("should export all files", async () => {
        const [barrel] = await flat({ entries: Path.join(fixtures, "flat") })()
        expect(barrel!.path).toBe(Path.join(fixtures, "flat/index.ts"))
        expect(barrel!.contents).toMatchSnapshot()
    })

    it("should include nested files and skip non-modules", async () => {
        const [barrel] = await flat({ entries: Path.join(fixtures, "flat"), include: ["*", "nested/*.ts"] })()
        expect(barrel!.contents).toMatchSnapshot()
    })
})

describe("run", () => {
    it("should write barrels and skip unchanged ones", async () => {
        const dir = await mkdtemp(Path.join(tmpdir(), "barrels-"))
        const path = Path.join(dir, "nested/index.ts")
        const config = async () => [{ contents: "a\n", path }]

        expect(await run([config])).toEqual([{ contents: "a\n", path }])
        expect(await readFile(path, "utf8")).toBe("a\n")
        expect(await run([config])).toEqual([])

        await rm(dir, { recursive: true })
    })
})
