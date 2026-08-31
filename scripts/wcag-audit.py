#!/usr/bin/env python3
"""Contrast audit over the house design tokens (--bg/--bg2/--text/--text2/--accent).
Evaluates each file in light mode and again with its dark-mode overrides applied."""
import re, sys, pathlib

def norm(h):
    h = h.lstrip('#')
    if len(h) == 3: h = ''.join(c*2 for c in h)
    return h if len(h) == 6 else None

def lum(h):
    h = norm(h)
    r, g, b = [int(h[i:i+2], 16)/255 for i in (0, 2, 4)]
    f = lambda c: c/12.92 if c <= 0.03928 else ((c+0.055)/1.055)**2.4
    return 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b)

def cr(a, b):
    l1, l2 = sorted([lum(a), lum(b)], reverse=True)
    return (l1+0.05)/(l2+0.05)

def blend(fg, a, bg):
    f, b = norm(fg), norm(bg)
    if not f or not b: return None
    return '#' + ''.join('%02x' % round(int(f[i:i+2],16)*a + int(b[i:i+2],16)*(1-a)) for i in (0,2,4))

HEX = re.compile(r'#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b')
RGBA = re.compile(r'rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,/\s]+([\d.]+))?\s*\)')

def resolve(val, bg):
    """Return a hex colour for a token value, blending rgba over bg. None if unresolvable."""
    val = val.strip().rstrip(';')
    m = HEX.search(val)
    if m and not RGBA.search(val): return m.group(0)
    m = RGBA.search(val)
    if m:
        r, g, b = (int(m.group(i)) for i in (1, 2, 3))
        a = float(m.group(4)) if m.group(4) else 1.0
        return blend('#%02x%02x%02x' % (r, g, b), a, bg)
    return None

TOKENS = ("--bg", "--bg2", "--text", "--text2", "--accent", "--border", "--accent-soft", "--link")

def tokens_in(block):
    out = {}
    for t in TOKENS:
        for m in re.finditer(re.escape(t) + r'\s*:\s*([^;}]+)', block):
            out[t] = m.group(1).strip()
    return out

def audit(path):
    try: src = path.read_text(errors='ignore')
    except Exception: return None
    if '--text' not in src or '--bg' not in src: return None

    # crude split: everything before the first dark-mode block is the light base
    dark_at = re.search(r'@media\s*\(\s*prefers-color-scheme\s*:\s*dark|\[data-theme=["\']?dark', src)
    light_src = src[:dark_at.start()] if dark_at else src
    base = tokens_in(light_src)
    modes = [("light", base)]
    if dark_at:
        dark = dict(base); dark.update(tokens_in(src[dark_at.start():]))
        modes.append(("dark", dark))

    findings = []
    for mode, t in modes:
        bg = resolve(t.get("--bg", ""), "#ffffff")
        if not bg: continue
        if not norm(bg): continue
        bg2 = resolve(t.get("--bg2", ""), bg) or bg
        soft = resolve(t.get("--accent-soft", ""), bg) or bg
        checks = [
            ("body text",        t.get("--text"),   bg,   4.5),
            ("secondary text",   t.get("--text2"),  bg,   4.5),
            ("secondary on card",t.get("--text2"),  bg2,  4.5),
            # links use --link where a palette defines one; --accent is fill-only there
            ("link text",        t.get("--link") or t.get("--accent"), bg,   4.5),
            ("link on hero",     t.get("--link") or t.get("--accent"), soft, 4.5),
            ("border",           t.get("--border"), bg,   3.0),
        ]
        for label, raw, on, need in checks:
            if not raw: continue
            fg = resolve(raw, on)
            if not fg: continue
            if not norm(fg) or not norm(on): continue
            r = cr(fg, on)
            if r < need:
                findings.append((r, need, mode, label, fg, on))
    return findings

root = pathlib.Path.home() / "Documents/Code"
SKIP = {"node_modules", ".next", "dist", "out", "_site", ".git", "build", ".wrangler"}
rows = []
for p in root.rglob("*"):
    if p.suffix not in (".css", ".html") or not p.is_file(): continue
    if SKIP & set(p.parts): continue
    f = audit(p)
    if f:
        for r in f: rows.append((p.relative_to(root),) + r)

# Borders are advisory: WCAG 1.4.11 covers UI components and meaningful graphics,
# not decorative 1px dividers. Text failures are the real ones.
text_rows = [r for r in rows if r[4] != "border"]
edge_rows = [r for r in rows if r[4] == "border"]
text_rows.sort(key=lambda x: x[1])

print(f"{len(text_rows)} text contrast failures ({len(edge_rows)} border findings, advisory only)\n")
cur = None
for path, r, need, mode, label, fg, on in text_rows:
    proj = str(path).split('/')[0]
    if proj != cur: print(f"\n{proj}"); cur = proj
    print(f"  {r:5.2f} (need {need})  {mode:5} {label:18} {fg} on {on}   {path}")

if "--all" in sys.argv:
    print("\n--- advisory: low-contrast borders ---")
    for path, r, need, mode, label, fg, on in sorted(edge_rows, key=lambda x: x[1]):
        print(f"  {r:5.2f}  {mode:5} {fg} on {on}   {path}")

print("""
Heuristic, not a browser: it reads the house --bg/--text/--accent tokens and
checks the pairs the templates actually render. It cannot see which token a
given element really uses, and the light/dark split is a crude source split,
so spot-check before changing a palette.""")
