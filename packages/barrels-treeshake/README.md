<div align="center">

<h1>barrels-treeshake</h1>

**Replaces the members of imported namespaces with direct imports.**

</div>

Before:

```ts
import { User } from "#utils";

const email = User.email(user);
```

After:

```ts
import { email as _email } from "#utils/User/email";

const email = _email(user);
```

This makes namespaces, such as the ones created by [`@monstermann/barrels`](../barrels), free in bundle size without relying on what a bundler is able to tree-shake.

## Installation

```sh
bun add -D @monstermann/barrels-treeshake
```

## Usage

You decide which namespaces are replaced and what they are replaced with: `resolve` is called for each member of an imported namespace and returns the import that should be used instead, or nothing to leave the namespace alone.

```ts
import { treeshake } from "@monstermann/barrels-treeshake";

treeshake({
    resolve({ importAlias, importName, importPath, propertyName }) {
        if (importPath !== "#utils") return;
        return `import { ${propertyName} as ${importAlias} } from "#utils/${importName}/${propertyName}";`;
    },
});
```

| Property       | `import { Foo as Bar } from "foo"; Bar.baz` | Description                                                 |
| -------------- | ------------------------------------------- | ----------------------------------------------------------- |
| `importName`   | `"Foo"`                                     | `"*"` for `import * as Foo`, `undefined` for `import Foo`.  |
| `localName`    | `"Bar"`                                     |                                                             |
| `importPath`   | `"foo"`                                     |                                                             |
| `propertyName` | `"baz"`                                     |                                                             |
| `importAlias`  | `"_baz"`                                    | A unique identifier to use as the local name of the import. |
| `filePath`     |                                             | The file that is being transformed.                         |
| `scope`        |                                             | All identifiers used in the file.                           |

`resolve` can be a list of resolvers, the first result is used.

### Vite, Rolldown, tsdown

```ts
import { treeshake } from "@monstermann/barrels-treeshake";

export default defineConfig({
    plugins: [treeshake({ enforce: "pre", resolve })],
});
```

| Option    | Default        | Description                                                            |
| --------- | -------------- | ---------------------------------------------------------------------- |
| `resolve` |                | See above.                                                             |
| `include` | `/\.[jt]sx?$/` | RegExp(s), only files whose path matches are transformed.              |
| `exclude` |                | RegExp(s), files whose path matches are skipped.                       |
| `enforce` |                | `"pre"` or `"post"`.                                                   |
| `debug`   | `false`        | `true` or a RegExp matching file paths, prints what is being replaced. |

### Bun

`Bun.build` only uses the first `onLoad` that returns something, so call `transform` from your own:

```ts
import { transform } from "@monstermann/barrels-treeshake";

await Bun.build({
    entrypoints: ["./src/index.ts"],
    plugins: [
        {
            name: "transforms",
            setup(build) {
                build.onLoad(
                    { filter: /\.tsx?$/ },
                    async ({ loader, path }) => {
                        const code = await Bun.file(path).text();
                        return {
                            contents:
                                transform(code, path, { resolve })?.code ??
                                code,
                            loader,
                        };
                    },
                );
            },
        },
    ],
});
```

### Standalone

```ts
import { transform } from "@monstermann/barrels-treeshake";

const result = transform(code, "source.ts", { resolve });
result?.code;
result?.map;
```

## Details

- Named, default and wildcard imports are supported, as well as JSX (`<Foo.Bar />`).
- A namespace is left untouched when one of its members is not resolved, or when the namespace itself is needed: `const x = Foo`, `export { Foo }`, `Foo["bar"]`, `Foo.bar = 1`.
- Declarations shadowing an import are respected.
- When a namespace is also used as a type (`let rect: Rect = Rect.create()`), an `import type` is kept for it.
- Only the first level is replaced: `Foo.bar.baz` becomes `_bar.baz`.
