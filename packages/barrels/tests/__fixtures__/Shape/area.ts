import type { Shape } from "./types"

export function area(shape: Shape): number {
    return shape.width * shape.height
}
