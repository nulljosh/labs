# byo-shell

A Unix shell built from scratch in C, following the [build-your-own-x](https://github.com/codecrafters-io/build-your-own-x) shell guides.

## Build & run

```
cc shell.c -o byo-shell
./byo-shell
```

## Status

Basic REPL: read a line, fork/exec, wait. No built-ins, pipes, or redirection yet.

## Next steps

- [ ] Built-ins: `cd`, `pwd`, `export`
- [ ] Pipes (`|`)
- [ ] Redirection (`>`, `>>`, `<`)
- [ ] Background jobs (`&`)
- [ ] Environment variable expansion
