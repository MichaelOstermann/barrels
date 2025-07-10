# exports

```ts
function Source.exports(source: Source | Source[]): Promise<Source[]>
```

Takes a `source` or a list of sources, typically file sources coming from [`Source.file`](./file) or [`Source.files`](./files) and recursively extracts their export declarations.

The goal is to extract identifiers needed to create barrels such as [namespace](../Barrel/namespace#example) or [record](../Barrel/record#example) barrels.

`Source.exports` will return any sources that already have a valid identifier as-is, for example named exports or manually defined aliases via [`Source.setImportAlias`](./setImportAlias) - if this behavior is insufficient, you can use [`SourceModule.exports`](../SourceModule/exports) directly instead.

## Example

```ts [source.ts]
export const foo = true;
export const bar = true;
```

```ts
const source = await Source.file("./source.ts");
const exports = [source];
Barrel.record(exports, { name: "Foo" });
```

```ts
import * from "./source.ts";

export const Foo = {
    // We can't define the fields because we don't know what they are
}
```

Compared to using `Source.exports`:

```ts
const source = await Source.file("./source.ts");
const exports = [source]; // [!code --]
const exports = await Source.exports(source); // [!code ++]
Barrel.record(exports, { name: "Foo" });
```

```ts
import {
    foo, // [!code ++]
    bar, // [!code ++]
} from "./source.ts";

export const Foo = {
    foo, // [!code ++]
    bar, // [!code ++]
};
```
