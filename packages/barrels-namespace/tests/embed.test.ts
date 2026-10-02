import { Source, Sources } from "@monstermann/barrels"
import { pipe } from "@monstermann/dfdl"
import { beforeAll, describe, expect, it } from "vitest"
import { embeds } from "../src/embed"

const fixturePath = "./packages/barrels-namespace/tests/__fixtures__/imports.ts"
const barrelPath = "./packages/barrels-namespace/tests/__fixtures__/index.d.ts"

let imports: string

beforeAll(async () => {
    const source = await Source.file(fixturePath)
    const embed = await embeds([source!])
    imports = pipe(
        embed.imports,
        sources => Sources.importFrom(sources, barrelPath),
        sources => Sources.remapTsExtensions(sources),
        sources => Sources.asValues(sources),
        sources => Sources.toImports(sources),
    )
})

describe("embeds", () => {
    it("should keep named imports", () => {
        expect(imports).toContain(`import { Node } from "oxc-parser";`)
    })

    it("should keep aliases of named imports", () => {
        expect(imports).toContain(`import { TSConfckParseResult as ParseResult } from "tsconfck";`)
    })

    it("should keep aliases of relative named imports", () => {
        expect(imports).toContain(`import { Thing as Renamed } from "./source.js";`)
    })

    it("should keep default imports", () => {
        expect(imports).toContain(`import Local from "./source.js";`)
    })

    it("should keep namespace imports", () => {
        expect(imports).toContain(`import * as Namespace from "./source.js";`)
    })

    it("should keep imports of unresolvable modules", () => {
        expect(imports).toContain(`import { ParsedPath } from "node:path";`)
    })

    it("should keep specifiers of tsconfig aliases that resolve to local files", () => {
        expect(imports).toContain(`import { Source as Aliased } from "@monstermann/barrels";`)
    })
})
