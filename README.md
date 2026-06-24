# byo-regex-engine

A regex engine built from scratch in TypeScript, following the [build-your-own-x](https://github.com/codecrafters-io/build-your-own-x) regex engine guides.

## Supports

`.`, literals, `*`, `+`, `?`, `|`, `(...)` grouping.

## Usage

```ts
import { test } from "./src/index.js";

test("a(b|c)*d", "abcbcd"); // true
```

## Next steps

- [ ] Anchors `^` and `$`
- [ ] Character classes `[abc]`, `[^abc]`
- [ ] Escape sequences (`\d`, `\w`, `\s`)
- [ ] Capture groups
- [ ] Tests (`node --test`)
