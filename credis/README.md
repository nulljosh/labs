# credis

Minimal Redis-protocol (RESP) server in C. PING/SET/GET/DEL over a raw hash table.

```
make        # builds ./credis
./credis    # listens on :6390
make test   # smoke test via nc
```

Talk to it with real redis-cli too: `redis-cli -p 6390`.

Single-process, one client at a time (blocking), no threads/fork, so the
in-memory table needs no locking or IPC. Add `select()`/`epoll` if concurrent
clients are ever needed.

[Technical whitepaper](WHITEPAPER.md)
