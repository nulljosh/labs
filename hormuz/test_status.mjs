// node test_status.mjs
import assert from "node:assert";
import { readStatus } from "./worker.js";
const day = (n) => ({ date: "2026-09-13", n_total: n, n_tanker: 1 });
assert.equal(readStatus(Array(7).fill(day(6))).open, false);
assert.equal(readStatus(Array(7).fill(day(80))).open, true);
assert.equal(readStatus(Array(7).fill(day(6))).transits_per_day, 6);
const mixed = [...Array(7).fill(day(2)), ...Array(50).fill(day(85))];
assert.equal(readStatus(mixed).open, false); // only the newest 7 days count
assert.equal(readStatus(mixed).history.length, 57);
console.log("ok");
