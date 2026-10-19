// The engine is already covered by engine.test.js. This only covers the boundary the
// network surfaces add: untrusted input reaching callTool.

import { describe, it, expect } from 'vitest';
import { callTool, ToolError, MAX_TEXT } from './tools.js';
import { DEFAULT_COLS, DEFAULT_ROWS } from './engine.js';

const bad = (name, args) => expect(() => callTool(name, args)).toThrow(ToolError);

describe('list_components', () => {
  it('returns every preset with its categories', () => {
    const r = callTool('list_components', {});
    expect(r.count).toBe(r.components.length);
    expect(r.components.length).toBeGreaterThan(0);
    expect(r.categories).toContain(r.components[0].category);
  });

  it('filters by category', () => {
    const cat = callTool('list_components', {}).categories[0];
    const r = callTool('list_components', { category: cat });
    expect(r.components.every(c => c.category === cat)).toBe(true);
  });

  it('rejects an unknown category rather than silently returning nothing', () => {
    bad('list_components', { category: 'Nope' });
  });
});

describe('place_component', () => {
  it('stamps onto a blank grid when no text is given', () => {
    const r = callTool('place_component', { componentId: 'button', col: 0, row: 0 });
    expect(r.text.split('\n')).toHaveLength(DEFAULT_ROWS);
    expect(r.text.split('\n')[0]).toMatch(/^\[ OK \]/);
    expect(r.placed.id).toBe('button');
  });

  it('round-trips: the output is valid input to the next call', () => {
    const one = callTool('place_component', { componentId: 'button', col: 0, row: 0 });
    const two = callTool('place_component', { text: one.text, componentId: 'button', col: 0, row: 2 });
    expect(two.text.split('\n')[0]).toMatch(/^\[ OK \]/);
    expect(two.text.split('\n')[2]).toMatch(/^\[ OK \]/);
  });

  it('clips off-grid placement instead of throwing', () => {
    const r = callTool('place_component', { componentId: 'button', col: DEFAULT_COLS - 2, row: 0 });
    expect(r.text.split('\n')[0]).toHaveLength(DEFAULT_COLS);
  });

  it('rejects an unknown componentId', () => {
    bad('place_component', { componentId: 'not-a-thing', col: 0, row: 0 });
  });

  it('rejects non-integer and wildly out-of-range coordinates', () => {
    bad('place_component', { componentId: 'button', col: 1.5, row: 0 });
    bad('place_component', { componentId: 'button', col: 'three', row: 0 });
    bad('place_component', { componentId: 'button', col: 0, row: 999_999 });
    bad('place_component', { componentId: 'button', col: NaN, row: 0 });
  });

  it('requires coordinates at all', () => {
    bad('place_component', { componentId: 'button' });
  });

  it('rejects absurd grid dimensions', () => {
    bad('place_component', { componentId: 'button', col: 0, row: 0, cols: 0 });
    bad('place_component', { componentId: 'button', col: 0, row: 0, rows: 100_000 });
  });
});

describe('render_wireframe', () => {
  it('pads and clips to the grid', () => {
    const r = callTool('render_wireframe', { text: 'ab', cols: 5, rows: 2 });
    expect(r.text).toBe('ab   \n     ');
  });

  it('handles multi-byte characters as single cells', () => {
    const r = callTool('render_wireframe', { text: '│─┐', cols: 4, rows: 1 });
    expect(r.text).toBe('│─┐ ');
  });

  it('rejects a non-string and an oversized payload', () => {
    bad('render_wireframe', { text: 42 });
    bad('render_wireframe', { text: 'x'.repeat(MAX_TEXT + 1) });
  });
});

describe('dispatch', () => {
  it('returns null for an unknown tool so callers can 404 it', () => {
    expect(callTool('nope', {})).toBeNull();
  });

  it('survives null/garbage arguments', () => {
    expect(callTool('list_components', null).count).toBeGreaterThan(0);
    expect(callTool('list_components', 'nonsense').count).toBeGreaterThan(0);
  });
});
