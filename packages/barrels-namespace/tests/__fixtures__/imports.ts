import type { Source as Aliased } from "@monstermann/barrels"
import type { Node } from "oxc-parser"
import type { TSConfckParseResult as ParseResult } from "tsconfck"
import type Local from "./source"
import type * as Namespace from "./source"
import type { Thing as Renamed } from "./source"
import type { ParsedPath } from "node:path"

export interface Fixture {
    aliased: Aliased
    local: Local
    namespaced: Namespace.Thing
    node: Node
    parsedPath: ParsedPath
    parseResult: ParseResult
    renamed: Renamed
}
