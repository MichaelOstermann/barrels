# resolve

```ts
function SourceModule.resolve(
    path: string,
    fromFilePath?: string
): Promise<SourceModule | undefined>
```

Takes a `path` representing an import source and tries to resolve its physical location on disk, respecting many different things such as `tsconfig` path aliases.

`fromFilePath` can be used to define where `path` is being imported from, defaults to `process.cwd()`.

## Example

```ts
import { SourceModule } from "@monstermann/barrels";

const module = await SourceModule.resolve("@monstermann/barrels");
```

```ts
const module = {
    isExternal: true,
    filePath: "/Users/Foo/Bar/node_modules/@monstermann/barrels/dist/index.js",
    fileName: "index",
    extName: "js",
    dirPath: "/Users/Foo/Bar/node_modules/@monstermann/barrels/dist",
    dirName: "dist",
    tsconfigPath: "/Users/Foo/Bar/tsconfig.json",
};
```

An example using `fromFilePath`:

```ts [source.ts]
export * from "./utils";
```

To figure out where `./utils` is coming from exactly:

```ts
import { SourceModule } from "@monstermann/barrels";

const module = await SourceModule.resolve("./utils", "./source.ts");
```
