"""Halftone art for the landing: drawn here (no borrowed prints), shaded with gradients, dithered to dots.
Each PNG is a white dot mask on alpha; the page tints it with --band-art.
    python3 scripts/gen_art.py     needs rsvg-convert and magick
"""
import math, os, subprocess, tempfile

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "art")
G = '<defs><radialGradient id="s" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#303030"/></radialGradient><linearGradient id="l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#404040"/></linearGradient></defs>'

def ring_ticks(cx, cy, r, n=60, long=5, w=6):
    out = []
    for i in range(n):
        a = i * 2 * math.pi / n; l = r * (.1 if i % long == 0 else .05)
        out.append(f'<line x1="{cx + (r - l) * math.sin(a):.1f}" y1="{cy - (r - l) * math.cos(a):.1f}" x2="{cx + r * math.sin(a):.1f}" y2="{cy - r * math.cos(a):.1f}" stroke="#fff" stroke-width="{w * (2 if i % long == 0 else 1)}"/>')
    return "".join(out)

def gear(cx, cy, r, teeth, fill="url(#s)"):
    pts = []
    for i in range(teeth * 4):
        a = i * math.pi / (teeth * 2); rr = r if i % 4 in (0, 1) else r * .84
        pts.append(f"{cx + rr * math.cos(a):.1f},{cy + rr * math.sin(a):.1f}")
    return f'<polygon points="{" ".join(pts)}" fill="{fill}"/><circle cx="{cx}" cy="{cy}" r="{r * .55:.0f}" fill="#000"/><circle cx="{cx}" cy="{cy}" r="{r * .5:.0f}" fill="none" stroke="#fff" stroke-width="5"/><circle cx="{cx}" cy="{cy}" r="{r * .12:.0f}" fill="#fff"/>'

def face(cx, cy, r, h=10.1, m=8.4, s=None):
    def hand(a, l, w): return f'<line x1="{cx}" y1="{cy}" x2="{cx + l * math.sin(a):.1f}" y2="{cy - l * math.cos(a):.1f}" stroke="#fff" stroke-width="{w}" stroke-linecap="round"/>'
    out = f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#s)"/><circle cx="{cx}" cy="{cy}" r="{r * .93}" fill="#000"/>' + ring_ticks(cx, cy, r * .9, w=r / 60)
    out += hand(h * math.pi / 6, r * .5, r / 18) + hand(m * math.pi / 30, r * .75, r / 26)
    if s is not None: out += hand(s * math.pi / 30, r * .82, r / 70)
    return out + f'<circle cx="{cx}" cy="{cy}" r="{r / 20}" fill="#fff"/>'

def globe(cx, cy, r):
    out = f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#s)"/>'
    for k in (-.66, -.33, 0, .33, .66):
        out += f'<ellipse cx="{cx}" cy="{cy}" rx="{r * abs(1 - abs(k) * .35):.0f}" ry="{r * .0 + r * abs(k) * .0 + 0}" fill="none"/>'
    for i in range(1, 6):
        out += f'<ellipse cx="{cx}" cy="{cy}" rx="{r * i / 6:.0f}" ry="{r}" fill="none" stroke="#000" stroke-width="{r / 40}"/>'
    for i in range(-2, 3):
        y = cy + i * r / 3; w = math.sqrt(max(r * r - (i * r / 3) ** 2, 0))
        out += f'<line x1="{cx - w:.0f}" y1="{y:.0f}" x2="{cx + w:.0f}" y2="{y:.0f}" stroke="#000" stroke-width="{r / 40}"/>'
    return out

def bell(cx, cy, r):
    top = cy - r * .15
    return (f'<path d="M{cx - r * .72} {top} A{r * .72} {r * .72} 0 0 1 {cx + r * .72} {top} C{cx + r * .72} {cy + r * .35} {cx + r} {cy + r * .45} {cx + r * 1.05} {cy + r * .6} H{cx - r * 1.05} C{cx - r} {cy + r * .45} {cx - r * .72} {cy + r * .35} {cx - r * .72} {top} Z" fill="url(#s)"/>'
            f'<circle cx="{cx}" cy="{top - r * .72 - r * .1}" r="{r * .12}" fill="#fff"/><path d="M{cx - r * .22} {cy + r * .72} A{r * .22} {r * .22} 0 0 0 {cx + r * .22} {cy + r * .72} Z" fill="#fff"/>'
            + "".join(f'<path d="M{cx + d * r * 1.2} {cy - r * .45} q{d * r * .3} {r * .4} 0 {r * .8}" stroke="#fff" stroke-width="{r / 14}" fill="none" stroke-linecap="round"/>' for d in (-1, 1)))

def hourglass(cx, cy, r):
    return (f'<path d="M{cx - r} {cy - r} H{cx + r} L{cx + r * .06} {cy} L{cx + r} {cy + r} H{cx - r} L{cx - r * .06} {cy} Z" fill="url(#l)"/>'
            f'<rect x="{cx - r * 1.2}" y="{cy - r * 1.2}" width="{r * 2.4}" height="{r * .2}" fill="#fff"/><rect x="{cx - r * 1.2}" y="{cy + r}" width="{r * 2.4}" height="{r * .2}" fill="#fff"/>'
            f'<polygon points="{cx - r * .7},{cy + r * .95} {cx + r * .7},{cy + r * .95} {cx},{cy + r * .45}" fill="#fff"/>')

def moon(cx, cy, r):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#s)"/><circle cx="{cx + r * .45}" cy="{cy - r * .2}" r="{r * .85}" fill="#000"/>' + "".join(f'<circle cx="{cx + x * r}" cy="{cy + y * r}" r="{r * .035}" fill="#fff"/>' for x, y in ((1.2, -.8), (1.5, .1), (.9, -1.3), (1.7, -.6), (1.1, .7)))

def stopwatch(cx, cy, r):
    return (f'<rect x="{cx - r * .14}" y="{cy - r * 1.32}" width="{r * .28}" height="{r * .22}" fill="#fff"/>'
            + face(cx, cy, r, h=0, m=0, s=17).replace(f'<line x1="{cx}" y1="{cy}" x2="{cx:.1f}" y2="{cy - r * .5:.1f}"', '<line x1="0" y1="0" x2="0" y2="0"')
            + f'<circle cx="{cx}" cy="{cy}" r="{r * 1.06}" fill="none" stroke="#fff" stroke-width="{r / 14}"/>')

def pendulum(cx, cy, r):
    return (f'<line x1="{cx}" y1="{cy - r * 1.3}" x2="{cx + r * .5}" y2="{cy + r * .9}" stroke="#fff" stroke-width="{r / 16}"/><circle cx="{cx + r * .5}" cy="{cy + r * .9}" r="{r * .3}" fill="url(#s)"/>'
            f'<path d="M{cx - r * .9} {cy + r * 1.25} A{r * 1.4} {r * 1.4} 0 0 1 {cx + r * 1.9} {cy + r * 1.25}" stroke="#fff" stroke-width="{r / 40}" fill="none" stroke-dasharray="{r / 12} {r / 12}"/>')

SCENES = {  # name: (w, h, markup)
    "stage": (1400, 933, lambda w, h: face(w * .5, h * .5, h * .46, s=22) + gear(w * .14, h * .22, h * .17, 18) + gear(w * .88, h * .8, h * .22, 22)),
    "band": (1900, 1000, lambda w, h: face(w * .5, h * .52, h * .42, 10.1, 8.4, 41) + gear(w * .17, h * .5, h * .28, 24) + gear(w * .83, h * .45, h * .22, 18) + gear(w * .3, h * .88, h * .16, 14)),
    "world": (1200, 800, lambda w, h: globe(w * .5, h * .5, h * .42)),
    "alarm": (1200, 800, lambda w, h: bell(w * .5, h * .5, h * .34)),
    "timer": (1200, 800, lambda w, h: hourglass(w * .5, h * .5, h * .32)),
    "card-stopwatch": (900, 600, lambda w, h: stopwatch(w * .5, h * .56, h * .3)),
    "card-pendulum": (900, 600, lambda w, h: pendulum(w * .5, h * .5, h * .32)),
    "card-night": (900, 600, lambda w, h: moon(w * .5, h * .5, h * .34)),
}

for name, (w, h, draw) in SCENES.items():
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{G}<rect width="{w}" height="{h}" fill="#000"/>{draw(w, h)}</svg>'
    with tempfile.TemporaryDirectory() as t:
        open(f"{t}/a.svg", "w").write(svg)
        subprocess.run(["rsvg-convert", f"{t}/a.svg", "-o", f"{t}/a.png"], check=True)
        # dots: ordered halftone of the shaded gray, white where lit, then luminance becomes alpha
        subprocess.run(["magick", f"{t}/a.png", "-colorspace", "gray", "-ordered-dither", "h6x6a", "-write", f"{t}/m.png",
                        "-alpha", "off", "(", f"{t}/m.png", "-colorspace", "gray", ")", "-compose", "CopyOpacity", "-composite",
                        "-fill", "white", "-colorize", "100", f"{OUT}/{name}.png"], check=True)
    print(name, w, h)
