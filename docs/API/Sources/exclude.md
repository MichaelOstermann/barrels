# exclude

```ts
function Sources.exclude(
    sources: Source[],
    pattern: string | RegExp | readonly (string | RegExp)[]
): Source[]
```

Removes sources based on [`Source.matches`](../Source/matches).
