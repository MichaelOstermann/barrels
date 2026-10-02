import type { Unit } from "./internals/unit"
import type { ParsedPath } from "node:path"

export interface Shape {
    height: number
    unit?: Unit
    width: number
}

export type ShapeOptions = Shape & { path?: ParsedPath }
