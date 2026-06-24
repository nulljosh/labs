# byo-kv-database

A key-value database built from scratch in TypeScript, following the [build-your-own-x](https://github.com/codecrafters-io/build-your-own-x) database guides.

## Design

Append-only log file (`.kvlog`). Writes are appended as JSON lines; on startup, the log replays into an in-memory map for reads.

## Usage

```ts
import { KVStore } from "./src/index.js";

const db = new KVStore("./data.kvlog");
await db.load();
await db.set("foo", "bar");
db.get("foo"); // "bar"
```

## Next steps

- [ ] Log compaction / snapshotting
- [ ] Indexing (currently O(n) replay on load)
- [ ] Range queries
- [ ] Concurrent write safety
