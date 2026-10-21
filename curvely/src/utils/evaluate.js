import { parse } from 'mathjs';

// A vertical asymptote (tan(x), 1/x) yields two finite but huge values of opposite sign on
// adjacent pixels. Joining them draws a false vertical line, so the stroke has to break.
export function isAsymptoteJump(prevY, y, scale, height) {
  return Math.sign(y) !== Math.sign(prevY) && Math.abs(y - prevY) * scale > height * 2;
}

// `a = 3` defines a slider instead of a curve; distinct from `y = ...` curve definitions.
const SLIDER_RE = /^([a-zA-Z]\w*)\s*=\s*(-?\d+(?:\.\d+)?)$/;

// x, y and t are variables; r and theta belong to polar curves.
const RESERVED = new Set(['x', 'y', 't', 'r', 'theta']);

export function parseSlider(expr) {
  const m = expr.trim().match(SLIDER_RE);
  if (!m || RESERVED.has(m[1])) return null;
  return { name: m[1], value: Number(m[2]) };
}

// Any `=` not of the form `y = ...` is an implicit equation (x^2+y^2=1, x=3, ...):
// solved as f(x,y)=lhs-rhs=0 by marching squares instead of walking y=f(x) per pixel.
export function isImplicit(expr) {
  const cleaned = expr.trim();
  return cleaned.includes('=') && !/^[yr]\s*=/i.test(cleaned) && !parseSlider(cleaned);
}

// `(a, b)`: the outer parens must wrap the whole thing and hold exactly one top-level comma.
export function splitPair(expr) {
  const s = expr.trim();
  if (s[0] !== '(' || s[s.length - 1] !== ')') return null;
  let depth = 0;
  let comma = -1;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') depth++;
    else if (s[i] === ')' && --depth === 0 && i !== s.length - 1) return null;
    else if (s[i] === ',' && depth === 1) {
      if (comma !== -1) return null;
      comma = i;
    }
  }
  return comma === -1 ? null : [s.slice(1, comma).trim(), s.slice(comma + 1, -1).trim()];
}

const usesT = (node) => node.filter((n) => n.isSymbolNode && n.name === 't').length > 0;

// Parametric and polar curves are sampled over t (or theta) in [0, 2 pi].
// ponytail: fixed domain, a per-row range like Desmos's can come later.
export const T_MAX = Math.PI * 2;

// `y > x^2`, `x^2+y^2 <= 4`: exactly one comparison, nothing else on either side.
export function splitInequality(expr) {
  const m = expr.match(/^([^<>=]+)(<=|>=|<|>)([^<>=]+)$/);
  if (!m) return null;
  return { lhs: m[1].trim(), rhs: m[3].trim(), sign: m[2][0] === '>' ? 1 : -1, strict: m[2].length === 1 };
}

export function evaluate(expr) {
  if (parseSlider(expr)) return { fn: null, implicitFn: null, error: null };
  const cleaned = expr.trim();
  if (!cleaned) return { fn: null, implicitFn: null, error: null };

  const ineq = splitInequality(cleaned);
  if (ineq) {
    try {
      const lc = parse(ineq.lhs).compile();
      const rc = parse(ineq.rhs).compile();
      // region where sign * implicitFn > 0, edge where it is 0
      const implicitFn = (x, y, sliders) =>
        lc.evaluate({ x, y, ...sliders }) - rc.evaluate({ x, y, ...sliders });
      return { fn: null, implicitFn, inequality: { sign: ineq.sign, strict: ineq.strict }, error: null };
    } catch (e) {
      return { fn: null, implicitFn: null, error: e.message };
    }
  }

  const polar = cleaned.match(/^r\s*=\s*(.+)$/i);
  if (polar) {
    try {
      const rc = parse(polar[1]).compile();
      const paramFn = (t, sliders) => {
        const r = rc.evaluate({ theta: t, t, ...sliders });
        return [r * Math.cos(t), r * Math.sin(t)];
      };
      return { fn: null, implicitFn: null, paramFn, error: null };
    } catch (e) {
      return { fn: null, implicitFn: null, error: e.message };
    }
  }

  const pair = splitPair(cleaned);
  if (pair) {
    try {
      const [xn, yn] = pair.map((p) => parse(p));
      const [xc, yc] = [xn.compile(), yn.compile()];
      if (usesT(xn) || usesT(yn)) {
        const paramFn = (t, sliders) => [xc.evaluate({ t, ...sliders }), yc.evaluate({ t, ...sliders })];
        return { fn: null, implicitFn: null, paramFn, error: null };
      }
      const pointFn = (sliders) => [xc.evaluate({ ...sliders }), yc.evaluate({ ...sliders })];
      return { fn: null, implicitFn: null, pointFn, error: null };
    } catch (e) {
      return { fn: null, implicitFn: null, error: e.message };
    }
  }

  if (isImplicit(cleaned)) {
    const idx = cleaned.indexOf('=');
    const lhs = cleaned.slice(0, idx).trim();
    const rhs = cleaned.slice(idx + 1).trim();
    try {
      const lc = parse(lhs).compile();
      const rc = parse(rhs).compile();
      const implicitFn = (x, y, sliders) =>
        lc.evaluate({ x, y, ...sliders }) - rc.evaluate({ x, y, ...sliders });
      return { fn: null, implicitFn, error: null };
    } catch (e) {
      return { fn: null, implicitFn: null, error: e.message };
    }
  }

  const stripped = cleaned.replace(/^y\s*=\s*/i, '').trim();
  try {
    const compiled = parse(stripped).compile();
    return { fn: (x, sliders) => compiled.evaluate({ x, ...sliders }), implicitFn: null, error: null };
  } catch (e) {
    return { fn: null, implicitFn: null, error: e.message };
  }
}
