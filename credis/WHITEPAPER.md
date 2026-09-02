# credis Technical Whitepaper

**v0.1** | August 2026

Redis, the small version. `PING`, `SET`, `GET`, `DEL` over RESP in C, on a raw
hash table. Real `redis-cli` talks to it and can't tell the difference.

## Why RESP

The point of the exercise is that Redis's wire protocol is small enough to
implement by hand, and implementing it means the server is immediately usable
with every existing Redis client. RESP arrays of bulk strings in, simple
strings / bulk strings / integers out, that is the whole surface needed for
four commands.

## Concurrency Model

Single process, one client at a time, blocking accept. That is a deliberate
ceiling: with exactly one thread of execution there is no locking on the hash
table, no fork, and no IPC, so the storage layer is the hash table and nothing
else. The upgrade path is `select()` or `epoll` around the accept loop; nothing
in the table code has to change to get there.

## Storage

Open-addressed hash table in memory. No persistence, no RDB snapshot, no AOF
log. Restarting drops the keyspace.

## Build and Test

```
make        # builds ./credis
./credis    # listens on :6390
make test   # smoke test via nc
```

`make test` drives the four commands over a socket and asserts the replies, so
a protocol regression fails the build rather than showing up in a client.

## Scope

Not a Redis replacement. It is a protocol and data-structure exercise that
happens to be wire-compatible; expiry, eviction, pipelining, pub/sub,
transactions, and clustering are all out of scope.

## License

MIT 2026, Joshua Trommel
