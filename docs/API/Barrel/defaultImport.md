# defaultImport

```ts
function Barrel.defaultImport(options: {
    type?: boolean
    alias: string
    path: string
}): string
```

Creates a default import string.

## Example

```ts
import { Barrel } from "@monstermann/barrels";

// import bar from "foo";
Barrel.defaultImport({ path: "foo", alias: "bar" });

// import type bar from "foo";
Barrel.defaultImport({ path: "foo", alias: "bar", type: true });
```
