import { describe, it, expect } from 'vitest';
import { PATTERNS } from './patterns.js';
import { evaluateRow, expandRow, parseListDef } from './lists.js';
import { buildScope, parseSlider } from './evaluate.js';

describe('patterns', () => {
  for (const { name, rows } of PATTERNS) {
    it(`${name}: every row reads and draws something finite`, () => {
      const lists = Object.fromEntries(rows.map(parseListDef).filter(Boolean).map((l) => [l.name, l.items]));
      const sliders = Object.fromEntries(rows.map(parseSlider).filter(Boolean).map((s) => [s.name, s.value]));
      const scope = buildScope(rows, sliders);
      let drew = false;
      for (const row of rows) {
        const r = evaluateRow(row);
        expect(r.error ?? null, row).toBeNull();
        const { source, binds } = expandRow(row, lists);
        const c = binds.length ? evaluateRow(source) : r;
        const b = { ...scope, ...(binds[0] ?? {}) };
        const v = c.fn ? [c.fn(1, b)] : c.paramFn ? c.paramFn((c.tMin + c.tMax) / 2, b) : c.pointFn ? c.pointFn(b) : null;
        if (v) { expect(v.every(Number.isFinite), row).toBe(true); drew = true; }
      }
      expect(drew).toBe(true);
    });
  }
});
