export interface BarrelOptions {
    /**
     * Glob(s) to directories to create barrel files in.
     * @default process.cwd()
     */
    entries?: string | string[]
    /**
     * Glob(s) to exclude files, relative to each entry.
     * @default undefined
     */
    exclude?: string | string[]
    /**
     * Glob(s) to collect files, relative to each entry.
     * @default ["*.ts", "*.tsx"]
     */
    include?: string | string[]
}

export interface Barrel {
    contents: string
    path: string
}

export type BarrelConfig = () => Promise<Barrel[]>
