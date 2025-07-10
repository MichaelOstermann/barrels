# exports

```ts
function SourceModule.exports(
    module: SourceModule,
    deep?: boolean
): Promise<SourceExport[]>
```

Takes a `SourceModule` and collects all the export declarations from it.

The optional `deep` parameter can be used to recursively collect export declarations, for example when encountering wildcard re-exports (`export * from "…"`).

## Example

```ts [source.ts]
export type Foo = true;
export const bar = true;
export default true;
export * from "foo.ts";
```

```ts
import { SourceModule } from "@monstermann/barrels";

const module = await SourceModule.resolve("./source.ts");
const exports = await SourceModule.exports(module);
```

```ts
const exports = [
    {
        identifier: "Foo",
        isType: true,
        type: "Named",
    },
    {
        identifier: "bar",
        isType: false,
        type: "Named",
    },
    {
        identifier: "",
        isType: false,
        type: "Default",
    },
    {
        from: SourceModule,
        identifier: "",
        isType: false,
        type: "Wildcard",
    },
];
```
