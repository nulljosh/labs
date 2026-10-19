// Canvas engine — manages a 2D character grid
// Grid coordinate system: (col, row), 0-indexed

const DEFAULT_COLS = 100;
const DEFAULT_ROWS = 50;

function createGrid(cols = DEFAULT_COLS, rows = DEFAULT_ROWS) {
  return Array.from({ length: rows }, () => Array(cols).fill(' '));
}

function cloneGrid(grid) {
  return grid.map(row => [...row]);
}

function gridToText(grid) {
  return grid.map(row => row.join('')).join('\n');
}

function textToGrid(text, cols = DEFAULT_COLS, rows = DEFAULT_ROWS) {
  const grid = createGrid(cols, rows);
  const lines = text.split('\n');
  for (let r = 0; r < Math.min(lines.length, rows); r++) {
    const chars = [...lines[r]]; // spread handles multi-byte unicode
    for (let c = 0; c < Math.min(chars.length, cols); c++) {
      grid[r][c] = chars[c];
    }
  }
  return grid;
}

// Stamp a component template onto the grid at (col, row)
// Returns a new grid (immutable)
function stampComponent(grid, template, col, row) {
  const next = cloneGrid(grid);
  const rows = grid.length;
  const cols = grid[0].length;
  for (let dy = 0; dy < template.length; dy++) {
    const r = row + dy;
    if (r < 0 || r >= rows) continue;
    const chars = [...template[dy]];
    for (let dx = 0; dx < chars.length; dx++) {
      const c = col + dx;
      if (c < 0 || c >= cols) continue;
      next[r][c] = chars[dx];
    }
  }
  return next;
}

// Set a single character at (col, row)
function setChar(grid, col, row, char) {
  if (row < 0 || row >= grid.length) return grid;
  if (col < 0 || col >= grid[0].length) return grid;
  const next = cloneGrid(grid);
  next[row][col] = char || ' ';
  return next;
}

// Erase a rectangular region
function eraseRegion(grid, col, row, width, height) {
  const next = cloneGrid(grid);
  for (let dy = 0; dy < height; dy++) {
    const r = row + dy;
    if (r < 0 || r >= grid.length) continue;
    for (let dx = 0; dx < width; dx++) {
      const c = col + dx;
      if (c < 0 || c >= grid[0].length) continue;
      next[r][c] = ' ';
    }
  }
  return next;
}

// Pixel coordinate (px, py) → grid cell (col, row) given char dimensions
function pxToCell(px, py, charW, charH) {
  return {
    col: Math.floor(px / charW),
    row: Math.floor(py / charH),
  };
}

// Measure monospace character dimensions in a canvas element
function measureChar(ctx, fontFamily = 'monospace', fontSize = 14) {
  ctx.font = `${fontSize}px ${fontFamily}`;
  const metrics = ctx.measureText('M');
  return {
    w: metrics.width,
    h: fontSize * 1.2,
  };
}

// Initial engine state factory
function createState(cols = DEFAULT_COLS, rows = DEFAULT_ROWS) {
  return {
    grid: createGrid(cols, rows),
    cols,
    rows,
    cursor: { col: 0, row: 0 },
    history: [],
    future: [],
    selectedPreset: null,
  };
}

function pushHistory(state) {
  return {
    ...state,
    history: [...state.history.slice(-49), cloneGrid(state.grid)],
    future: [],
  };
}

function undo(state) {
  if (state.history.length === 0) return state;
  const prev = state.history[state.history.length - 1];
  return {
    ...state,
    grid: prev,
    history: state.history.slice(0, -1),
    future: [cloneGrid(state.grid), ...state.future.slice(0, 49)],
  };
}

function redo(state) {
  if (state.future.length === 0) return state;
  const next = state.future[0];
  return {
    ...state,
    grid: next,
    history: [...state.history.slice(-49), cloneGrid(state.grid)],
    future: state.future.slice(1),
  };
}
