# files

```ts
function Source.files(pattern: string | string[], options?): Promise<Source[]>
```

Like [`Source.file`](./file) but retrieves a list of file sources based on the provided paths or glob patterns.

`options` are forwarded to [`tinyglobby`](https://github.com/SuperchupuDev/tinyglobby?tab=readme-ov-file#options).

## Example

```ts
import { Source } from "@monstermann/barrels";

const files = await Source.files("./src/*.ts");
```
