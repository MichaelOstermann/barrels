---
aside: true
---

# Guide

## Example

```ts [barrels.config.ts]
import { defineConfig, Source, Sources, Barrel } from "@monstermann/barrels";

export default defineConfig([
    async () => {
        // Retrieve a list of files:
        const filepaths = Barrel.globFiles("./*.ts");

        // Convert paths to sources:
        const sources = await Sources.files(filepaths);

        // Optionally extract their export declarations:
        const exports = await Sources.exports(sources);

        // Use Source.* or Sources.* utilities to further manipulate sources:
        const a = Sources.importFrom(exports, "./index.ts");
        const b = Sources.removeExtensions(a);

        // Convert sources to strings - you can do whatever you'd like:
        const barrel = Sources.toExports(b);

        // Create the barrel file:
        await Barrel.write("./index.ts", barrel);
    },
]);
```

## Source

```ts
interface Source {
    // The resolved module on disk.
    module: SourceModule;
    // Export declaration details, extracted by reading and parsing files.
    // Empty if this source represent a file instead of a specific export.
    export?: SourceExport;
    // The import alias that should be used for re-exports.
    alias: string;
    // Whether this source should be considered to be a type declaration.
    isType: boolean;
    // The directory path that should be used when building re-exports.
    dirPath: string;
    // The extension name that should be used when building re-exports.
    extName: string;
}
```

A `Source` describes a single export declaration source when building re-exports, which can be a file such as when using [`Source.file(path)`](./Source/file), but can also represent a single export extracted from files, see [`SourceExport`](#sourceexport).

## SourceModule

```ts
interface SourceModule {
    // The absolute path of the directory.
    dirPath: string;
    // The absolute path of the file.
    filePath: string;
    // The file name without extension.
    fileName: string;
    // The file's extension.
    extName: string;
    // Whether this is an external dependency (coming from node_modules).
    isExternal: boolean;
    // The absolute path to the `tsconfig.json` that was used to resolve this.
    tsconfigPath: string;
    // Value of `tsconfig.compilerOptions.allowImportingTsExtensions` if present.
    allowImportingTsExtensions: boolean | undefined;
    // Value of `tsconfig.compilerOptions.moduleResolution` if present.
    moduleResolution: string | undefined;
}
```

Figuring out where modules actually come from can be quite complicated - sources can come from file paths, package names of external dependencies, fields defined in `package.json`, `tsconfig` path aliases, different module resolutions, etc.

The above structure represents the source of truth for the physical location on disk of any source, and can be constructed via [`SourceModule.resolve(path, fromFilePath?)`](./SourceModule/resolve), which will try to figure all of this out.

## SourceExport

```ts
interface SourceExport {
    // The type of this export.
    type: "Default" | "Wildcard" | "Named";
    // The identifier that was used to export this, an empty string by default.
    // eg. `foo` of `export const foo = …`.
    identifier: string;
    // Whether this is an exported type declaration.
    isType: boolean;
    // If this was a re-export, the resolved module this was imported from.
    from?: SourceModule;
}
```

Typically you would start collecting files as sources, for example via [`Source.file(path)`](./Source/file).

For some scenarios, such as building namespace barrels it is necessary to read the files and extract all their export declarations via [`Source.exports(source)`](./Source/exports) or [`SourceModule.exports(module)`](./SourceModule/exports) - the above is the data that is collected when collecting export declarations from files.

If the behavior is insufficient, you can inspect the ASTs of files yourself via [`Source.walkAst`](./Source/walkAst) or [`SourceModule.walkAst`](./SourceModule/walkAst).

## Barrel

`Barrel.*` contain misc utilities, most notably:

- [`Barrel.write`](./Barrel/write) - To write barrel file contents to disk
- [`Barrel.watch`](./Barrel/watch) - To track dependencies and rebuild barrels only when necessary
