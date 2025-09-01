export interface BarrelsOutput {
    barrels: { barrel: string, path: string }[]
    watchedPatterns: Map<string, (path: string) => boolean>
}
