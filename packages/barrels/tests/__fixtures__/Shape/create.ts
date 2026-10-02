import type { Shape, ShapeOptions } from "./types"

function create(options: ShapeOptions): Shape {
    return options
}

const empty: Shape = { height: 0, width: 0 }

export { create, empty as zero }

export default create
