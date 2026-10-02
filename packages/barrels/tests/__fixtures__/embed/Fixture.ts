import type { Node, ParseResult as Parsed } from "oxc-parser"
import type { GlobOptions as Aliased } from "tinyglobby"
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
    parseResult: Parsed
    renamed: Renamed
}
