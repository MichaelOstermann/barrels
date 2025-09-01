# files

```ts
function Sources.files(path: string[], options?: {
    alias?: string
    type?: boolean
}): Promise<Source[]>
```

Like [`Source.file`](../Source/file), but acts upon a list of `path`s.

Additionally modules that could not be resolved are removed from the result.
