# wildcardExport

```ts
function Barrel.wildcardExport(options: {
    type?: boolean
    alias?: string
    path: string
}): string
```

Creates a wildcard export string.

## Example

```ts
import { Barrel } from "@monstermann/barrels";

// export * from "foo";
Barrel.wildcardExport({ path: "foo" });

// export * as bar from "foo";
Barrel.wildcardExport({ path: "foo", alias: "bar" });

// export type * from "foo";
Barrel.wildcardExport({ path: "foo", type: true });
```
