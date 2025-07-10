# wildcardImport

```ts
function Barrel.wildcardImport(options: {
    type?: boolean
    alias: string
    path: string
}): string
```

Creates a wildcard import string.

## Example

```ts
import { Barrel } from "@monstermann/barrels";

// import * as bar from "foo";
Barrel.wildcardImport({ path: "foo", alias: "bar" });

// import type * as bar from "foo";
Barrel.wildcardImport({ path: "foo", alias: "bar", type: true });
```
