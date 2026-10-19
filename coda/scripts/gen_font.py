"""Quip Sans: Hanken Grotesk (marcologous/hanken-grotesk, SIL Open Font License 1.1, no reserved name), renamed,
with its curly quote marks redrawn as the Coda mark: a round ball with a long sweeping tail.

Hanken Grotesk sits between Helvetica's grotesk, SF's screen clarity and Lato's warmth, which is the brief
(Joshua, 2026-10-18). Same method as turing's Samantha Sans: pinned release, renamed, OFL shipped beside the fonts,
original copyright kept in the name table. The quote marks are the one thing drawn here, so every quote in the
game wears the logo. Figures are respaced to be proportional. Four weights, Latin only, every build the same bytes.

    python3 scripts/gen_font.py            # writes fonts/QuipSans-{Regular,Medium,Semibold,Bold}.{ttf,woff2} + OFL.txt
    python3 scripts/gen_font.py --check    # named Quip Sans, OFL present, proportional, I l 1 O 0 distinct, quotes redrawn
Needs fonttools, brotli and skia-pathops (uv run --with fonttools --with brotli --with skia-pathops).
"""
import io
import os
import sys
import urllib.request

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont
from fontTools.ttLib.removeOverlaps import removeOverlaps

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, "fonts")
SOURCE = "https://cdn.jsdelivr.net/npm/@fontsource/hanken-grotesk@5.3.0/"
WEIGHTS = {"Regular": 400, "Medium": 500, "Semibold": 600, "Bold": 700}
QUOTES = {"quoteright": 1, "quotedblright": 2, "quoteleft": 1, "quotedblleft": 2}
K = 0.5523  # cubic circle constant


def fetch(path):
    """Bytes of one file from the pinned Hanken Grotesk release."""
    with urllib.request.urlopen(SOURCE + path, timeout=60) as r:
        return r.read()


def nine(pen, cx, cy, r, d):
    """One closing mark: ball of radius r at (cx, cy), tail sweeping down-left to a point d below the centre.
    Same curve as the logo, with the vertical stretched to fit the font's quote height."""
    # clockwise, same winding as the tail, so the two union into one solid contour
    pen.moveTo((cx + r, cy))
    pen.curveTo((cx + r, cy - K * r), (cx + K * r, cy - r), (cx, cy - r))
    pen.curveTo((cx - K * r, cy - r), (cx - r, cy - K * r), (cx - r, cy))
    pen.curveTo((cx - r, cy + K * r), (cx - K * r, cy + r), (cx, cy + r))
    pen.curveTo((cx + K * r, cy + r), (cx + r, cy + K * r), (cx + r, cy))
    pen.closePath()
    pen.moveTo((cx + r, cy))
    pen.curveTo((cx + r, cy - 0.56 * d), (cx + 0.35 * r, cy - 0.85 * d), (cx - 0.75 * r, cy - d))
    pen.curveTo((cx - 0.15 * r, cy - 0.78 * d), (cx + 0.05 * r, cy - 0.56 * d), (cx - 0.2 * r, cy - 0.33 * d))
    pen.closePath()


def redraw_quotes(font):
    """Replace the four curly quotes with the mark, inside each original's box so spacing never moves."""
    glyphs = font.getGlyphSet()
    glyf, hmtx = font["glyf"], font["hmtx"]
    for name, count in QUOTES.items():
        bp = BoundsPen(glyphs)
        glyphs[name].draw(bp)
        x0, y0, x1, y1 = bp.bounds
        gap = 0.16 * (x1 - x0) if count == 2 else 0
        r = min((x1 - x0 - gap) / count / 2, (y1 - y0) / 3.3)   # the tail stays longer than the ball
        tt = TTGlyphPen(None)
        pen = Cu2QuPen(tt, max_err=1.0)
        if name.endswith("left"):   # opening marks are the closing ones turned 180 degrees in the same box
            pen = TransformPen(pen, (-1, 0, 0, -1, x0 + x1, y0 + y1))
        for i in range(count):
            cx = x1 - r - i * (2 * r + gap)
            nine(pen, cx, y1 - r, r, (y1 - r) - y0)
        glyf[name] = tt.glyph()
        glyf[name].recalcBounds(glyf)
        hmtx[name] = (hmtx[name][0], glyf[name].xMin)
    removeOverlaps(font, list(QUOTES))


def proportional_figures(font):
    """Hanken's figures are tabular (all 560 wide) and this cut has no pnum, so respace them: each digit keeps
    the 0's side bearings around its own ink. Score counters lose nothing they need; the brief is proportional."""
    glyf, hmtx, cmap = font["glyf"], font["hmtx"], font.getBestCmap()
    zero = glyf[cmap[ord("0")]]
    left, right = zero.xMin, hmtx[cmap[ord("0")]][0] - zero.xMax
    for d in "0123456789":
        name = cmap[ord(d)]
        g = glyf[name]
        g.coordinates.translate((left - g.xMin, 0))
        g.recalcBounds(glyf)
        hmtx[name] = (round(g.xMax - g.xMin + left + right), g.xMin)


def rename(font, style):
    """Give the outlines the Quip Sans name; copyright (0) and license (13, 14) stay as the authors wrote them."""
    names = {1: "Quip Sans", 2: style, 3: f"QuipSans-{style}", 4: f"Quip Sans {style}", 5: "Version 1.000",
             6: f"QuipSans-{style}", 16: "Quip Sans", 17: style}
    table = font["name"]
    table.names = [n for n in table.names if n.nameID in (0, 13, 14)]
    for nid, text in names.items():
        table.setName(text, nid, 3, 1, 0x409)
        table.setName(text, nid, 1, 0, 0)
    font["head"].created = font["head"].modified = 3_700_000_000   # fixed, so every build is the same bytes
    font["OS/2"].achVendID = "QUIP"


def to_bytes(font, flavor):
    """The font as TTF (flavor None) or WOFF2 bytes."""
    font.flavor = flavor
    buf = io.BytesIO()
    font.save(buf, reorderTables=False)
    return buf.getvalue()


def check():
    """Self-check of the shipped files."""
    assert os.path.exists(os.path.join(OUT, "OFL.txt")), "the OFL must ship with the fonts"
    for style in WEIGHTS:
        for ext in ("ttf", "woff2"):
            f = TTFont(os.path.join(OUT, f"QuipSans-{style}.{ext}"))
            assert f["name"].getDebugName(1) == "Quip Sans" and f["name"].getDebugName(6) == f"QuipSans-{style}"
            assert "Hanken" in f["name"].getDebugName(0), "the original copyright must stay in the name table"
            cmap, hmtx, glyf = f.getBestCmap(), f["hmtx"], f["glyf"]
            assert hmtx[cmap[ord("i")]][0] < hmtx[cmap[ord("m")]][0], "letters are not proportional"
            assert hmtx[cmap[ord("1")]][0] < hmtx[cmap[ord("0")]][0], "figures are not proportional"
            shapes = {glyf[cmap[ord(c)]].coordinates.array.tobytes() for c in "Il1O0"}
            assert len(shapes) == 5, "two of I l 1 O 0 are drawn the same"
            for q in QUOTES:   # redrawn: one ball-and-tail contour per mark, inside the advance
                g = glyf[q]
                assert g.numberOfContours == QUOTES[q], f"{q} is not the mark"
                assert 0 <= g.xMin and g.xMax <= hmtx[q][0], f"{q} spills out of its advance"
    print(f"font ok: Quip Sans (Hanken Grotesk, OFL), {len(WEIGHTS)} weights, quotes redrawn")


def main():
    """Fetch Hanken Grotesk, redraw its quotes, rename it, write every weight and the license; or run the check."""
    if "--check" in sys.argv:
        return check()
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, "OFL.txt"), "wb") as f:
        f.write(fetch("LICENSE"))
    for style, weight in WEIGHTS.items():
        font = TTFont(io.BytesIO(fetch(f"files/hanken-grotesk-latin-{weight}-normal.woff2")))
        redraw_quotes(font)
        proportional_figures(font)
        rename(font, style)
        for ext, flavor in (("ttf", None), ("woff2", "woff2")):
            with open(os.path.join(OUT, f"QuipSans-{style}.{ext}"), "wb") as f:
                f.write(to_bytes(font, flavor))
        print(f"QuipSans-{style}: Hanken Grotesk {weight}")


if __name__ == "__main__":
    main()
