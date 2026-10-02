export interface TreeShakeImportData {
    /** The file that is being transformed. */
    filePath: string
    /** A unique identifier that can be used as the local name of the new import. */
    importAlias: string
    /** `"Foo"` for `import { Foo }`, `"*"` for `import * as Foo`, `undefined` for `import Foo`. */
    importName: string | undefined
    /** `"foo"` for `import { Foo } from "foo"`. */
    importPath: string
    /** `"Bar"` for `import { Foo as Bar }`. */
    localName: string
    /** `"bar"` for `Foo.bar`. */
    propertyName: string
    /** All identifiers used in the file. */
    scope: Set<string>
}

/**
 * Returns the import that should replace a member of a namespace, for example
 * `import { bar as _bar } from "foo/bar"`, or nothing to leave the namespace untouched.
 */
export interface TreeShakeImportResolver {
    (importData: TreeShakeImportData): string | null | undefined | false | void
}

export interface TreeShakeImportsOptions {
    /** Prints what is being resolved and replaced. */
    debug?: boolean
    resolve: TreeShakeImportResolver | TreeShakeImportResolver[]
}

export interface TreeShakeImportsResult {
    code: string
    map: SourceMap
}

type SourceMap = import("magic-string").SourceMap
