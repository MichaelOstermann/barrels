# matches

```ts
function SourceModule.matches(
    module: SourceModule,
    pattern: string | RegExp | readonly (string | RegExp)[]
): boolean
```

Takes a `SourceModule` and checks whether the physical location on disk matches any of the provided RegExps or glob patterns.

## Example

```ts
import { SourceModule } from "@monstermann/barrels";

const module = await SourceModule.resolve("@monstermann/barrels");

SourceModule.matches(module, "**/node_modules/**"); // true
```
