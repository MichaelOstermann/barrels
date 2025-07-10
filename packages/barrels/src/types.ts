import type { FilterPattern } from "unplugin-utils"
import type { Source } from "./Source"

type MaybePromise<T> = T | Promise<T>

export interface BarrelsOutput {
    barrels: { barrel: string, path: string }[]
    watchedPatterns: Map<string, (path: string) => boolean>
}

export interface BaseBarrelConfig {
    banner?: boolean | string
    directories?: string | string[]
    exclude?: Exclude<FilterPattern, null>
    extensions?: "auto" | false | Record<string, string>
    files: string | string[]
    include?: Exclude<FilterPattern, null>
    output?: string | ((directory: string) => string)
    resolveExports?: boolean
    transformBarrel?: (barrel: string) => MaybePromise<string>
    transformSources?: (sources: Source[]) => MaybePromise<Source[]>
}

export interface FlatBarrelConfig extends BaseBarrelConfig {
    type: "flat"
}

export interface NamespaceBarrelConfig extends BaseBarrelConfig {
    indentation?: number
    name?: string | ((filePath: string) => string)
    type: "namespace"
    types?: "merge" | "nested" | "flat"
}

export interface RecordBarrelConfig extends BaseBarrelConfig {
    indentation?: number
    name?: string | ((filePath: string) => string)
    type: "record"
}

export interface CustomBarrelConfig {
    (): MaybePromise<void>
}

export type BarrelConfig =
    | FlatBarrelConfig
    | NamespaceBarrelConfig
    | RecordBarrelConfig
