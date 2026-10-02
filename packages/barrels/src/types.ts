export interface BarrelOptions {
    /**
     * Glob(s) to directories to create barrel files in.
     * @default process.cwd()
     */
    entries?: string | string[]
    /**
     * Glob(s), relative to each entry, or RegExp(s), tested against the absolute path, to exclude matched files.
     * @default undefined
     */
    exclude?: string | RegExp | (string | RegExp)[]
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
