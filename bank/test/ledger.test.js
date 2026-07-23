import test from "node:test";
import assert from "node:assert";
import { getAccount, post } from "../lib/ledger.js";

test("ledger posts and rejects overdraft", () => {
  const start = getAccount("demo").balanceCents;
  post("demo", -500, "coffee");
  assert.equal(getAccount("demo").balanceCents, start - 500);
  assert.throws(() => post("demo", -10_000_000_00, "yacht"));
  assert.throws(() => post("demo", 0.5, "float"));
});
