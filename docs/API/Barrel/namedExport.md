# namedExport

```ts
function Barrel.namedExport(options: {
    type?: boolean
    name: string
    alias?: string
    path: string
}): string
```

Creates a named export string.

## Example

```ts
import { Barrel } from "@monstermann/barrels";

// export { foo } from "bar";
Barrel.namedExport({ name: "foo", path: "bar" });

// export { foo as baz } from "bar";
Barrel.namedExport({ name: "foo", path: "bar", alias: "baz" });

// export type { foo } from "bar";
Barrel.namedExport({ name: "foo", path: "bar", type: true });
```
