# include

```ts
function Sources.include(
    sources: Source[],
    pattern: string | RegExp | readonly (string | RegExp)[]
): Source[]
```

Filters sources based on [`Source.matches`](../Source/matches).
