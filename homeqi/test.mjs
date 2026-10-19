import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const grab = re => html.match(re)[0];
const src = [
  grab(/var LAYERS = \[[\s\S]*?\];/),
  grab(/var QUESTIONS = \[[\s\S]*?\];/),
  grab(/function tally\(a\) \{[\s\S]*?\n\}/),
  grab(/function concerns\(a\) \{[\s\S]*?\n\}/),
].join("\n");
const ctx = {};
vm.runInNewContext(src + "\nthis.LAYERS=LAYERS;this.QUESTIONS=QUESTIONS;this.tally=tally;this.concerns=concerns;", ctx);
const { LAYERS, QUESTIONS, tally, concerns } = ctx;

test("every question belongs to a layer", () => {
  const ids = new Set(LAYERS.map(l => l.id));
  for (const q of QUESTIONS) assert.ok(ids.has(q.layer), q.layer);
});

test("tally counts totals, answered and concerns", () => {
  const empty = tally([]);
  assert.equal(Object.values(empty).reduce((s, t) => s + t.total, 0), QUESTIONS.length);
  const allBad = tally(QUESTIONS.map(q => q.bad));
  for (const t of Object.values(allBad)) { assert.equal(t.answered, t.total); assert.equal(t.concerns, t.total); }
});

test("concerns returns only bad answers", () => {
  const a = QUESTIONS.map(q => q.bad); a[0] = "__other__";
  assert.equal(concerns(a).length, QUESTIONS.length - 1);
});
