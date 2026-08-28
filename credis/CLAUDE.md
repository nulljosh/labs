# credis

Minimal RESP (Redis protocol) server, written in C as a learning exercise.

## What's here
- `server.c` — single-process, blocking TCP server. Hash table + RESP parser. Commands: PING, SET, GET, DEL.
- `test.sh` — smoke test via `nc`, run with `make test`.

## Design notes
- Single process, one client at a time (blocking accept loop) — no threads, no fork, no locking needed since the hash table only ever lives in one process's memory.
- Originally used `fork()` per connection; reverted because each child got a copy-on-write copy of the table, so writes never reached other connections. Root cause, not a symptom patch.
- Upgrade path if concurrency is ever needed: `select()`/`epoll` event loop, not threads/fork (keeps the table single-owner).
