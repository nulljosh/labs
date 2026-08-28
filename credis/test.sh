#!/bin/sh
# Smoke test: boot server, drive it with raw RESP over nc, assert replies.
set -e
./credis & SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT
sleep 0.3

req() { printf '%b' "$1" | nc -w1 localhost 6390; }

out=$(req '*1\r\n$4\r\nPING\r\n')
echo "$out" | grep -q '+PONG' && echo "PASS: PING" || { echo "FAIL: PING got [$out]"; exit 1; }

out=$(req '*3\r\n$3\r\nSET\r\n$3\r\nfoo\r\n$3\r\nbar\r\n')
echo "$out" | grep -q '+OK' && echo "PASS: SET" || { echo "FAIL: SET got [$out]"; exit 1; }

out=$(req '*2\r\n$3\r\nGET\r\n$3\r\nfoo\r\n')
echo "$out" | grep -q 'bar' && echo "PASS: GET" || { echo "FAIL: GET got [$out]"; exit 1; }

out=$(req '*2\r\n$3\r\nDEL\r\n$3\r\nfoo\r\n')
echo "$out" | grep -q ':1' && echo "PASS: DEL" || { echo "FAIL: DEL got [$out]"; exit 1; }

echo "all tests passed"
