# matches

```ts
function Source.matches(
    source: Source,
    pattern: string | RegExp | readonly (string | RegExp)[]
): boolean
```

Takes a `source` and checks whether the physical location on disk matches any of the provided RegExps or glob patterns.

## Example

```ts
import { Source } from "@monstermann/barrels";

const file = await Source.file("@monstermann/barrels");

Source.matches(file, "**/node_modules/**"); // true
```
