# defaultExport

```ts
function Barrel.defaultExport(options: {
    type?: boolean
    alias?: string
    path: string
}): string
```

Creates a default export string.

## Example

```ts
import { Barrel } from "@monstermann/barrels";

// export { default } from "foo";
Barrel.defaultExport({ path: "foo" });

// export { default as bar } from "foo";
Barrel.defaultExport({ path: "foo", alias: "bar" });

// export type { default } from "foo";
Barrel.defaultExport({ path: "foo", type: true });
```
