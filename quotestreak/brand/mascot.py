"""Quip, the Quotestreak mascot: the logo's opening quote mark come to life. The ball is the body, the tail is
its cowlick. Flat two-tone (marquee yellow, night ink), no text, four poses.

    python3 brand/mascot.py   # writes brand/quip-{pose}.svg, a -dark twin for dark grounds, and brand/Quip.xcassets
"""
import os

YELLOW, INK, CREAM = "#ffcc00", "#15161a", "#f5f0e4"
K = 0.5523
HERE = os.path.dirname(os.path.abspath(__file__))


def body(cx, cy, r, d):
    """The mark turned upright: ball at (cx, cy), tail sweeping up and right to a point d above the centre."""
    # the closing mark from scripts/gen_font.py, turned 180 degrees about the ball's centre
    pts = lambda *xy: " ".join(f"{cx - x:.1f},{cy + y:.1f}" for x, y in xy)
    tail = (f"M{pts((r, 0))} C{pts((r, -0.56 * d), (0.35 * r, -0.85 * d), (-0.75 * r, -d))} "
            f"C{pts((-0.15 * r, -0.78 * d), (0.05 * r, -0.56 * d), (-0.2 * r, -0.33 * d))} Z")
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{YELLOW}"/><path d="{tail}" fill="{YELLOW}"/>'


def eye(x, y, kind):
    if kind == "open":
        return (f'<ellipse cx="{x}" cy="{y}" rx="17" ry="24" fill="{INK}"/>'
                f'<circle cx="{x + 6}" cy="{y - 9}" r="6" fill="#fff"/>')
    if kind == "happy":   # closed, smiling arcs
        return f'<path d="M{x - 18},{y + 6} Q{x},{y - 18} {x + 18},{y + 6}" stroke="{INK}" stroke-width="10" fill="none" stroke-linecap="round"/>'
    if kind == "wide":    # surprised: big white, small pupil
        return (f'<circle cx="{x}" cy="{y}" r="24" fill="#fff" stroke="{INK}" stroke-width="7"/>'
                f'<circle cx="{x}" cy="{y + 2}" r="9" fill="{INK}"/>')
    if kind == "focus":   # determined: open eye under a slanted lid
        return (f'<ellipse cx="{x}" cy="{y + 4}" rx="16" ry="19" fill="{INK}"/>'
                f'<circle cx="{x + 6}" cy="{y - 3}" r="5" fill="#fff"/>'
                f'<path d="M{x - 24},{y - 22} L{x + 22},{y - 10}" stroke="{INK}" stroke-width="9" stroke-linecap="round"/>')


def limb(d, ink=INK):
    return f'<path d="{d}" stroke="{ink}" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'


def pose(name, ink=INK):
    """ink colours the limbs, feet and motion marks: night ink on light grounds, cream on dark ones.
    The face is always ink, since it sits on yellow."""
    cx, cy, r = 256, 330, 132
    parts, tilt, extra = [], 0, ""
    feet = (f'<ellipse cx="{cx - 52}" cy="{cy + r + 4}" rx="34" ry="14" fill="{ink}"/>'
            f'<ellipse cx="{cx + 52}" cy="{cy + r + 4}" rx="34" ry="14" fill="{ink}"/>')
    mouth = {
        "idle": f'<path d="M{cx - 26},{cy + 34} Q{cx},{cy + 58} {cx + 26},{cy + 34}" stroke="{INK}" stroke-width="10" fill="none" stroke-linecap="round"/>',
        "cheer": f'<path d="M{cx - 36},{cy + 26} Q{cx},{cy + 92} {cx + 36},{cy + 26} Z" fill="{INK}"/>'
                 f'<path d="M{cx - 18},{cy + 58} Q{cx},{cy + 46} {cx + 18},{cy + 58} Q{cx},{cy + 76} {cx - 18},{cy + 58}" fill="#ff6fae"/>',
        "oops": f'<path d="M{cx - 30},{cy + 50} q10,-12 20,0 t20,0 t20,0" stroke="{INK}" stroke-width="9" fill="none" stroke-linecap="round"/>',
        "streak": f'<path d="M{cx - 30},{cy + 36} Q{cx},{cy + 62} {cx + 34},{cy + 30}" stroke="{INK}" stroke-width="10" fill="none" stroke-linecap="round"/>',
    }[name]
    eyes = {"idle": "open", "cheer": "happy", "oops": "wide", "streak": "focus"}[name]
    arms = {
        "idle": limb(ink=ink, d=f"M{cx - r + 6},{cy + 40} q-34,26 -26,62") + limb(ink=ink, d=f"M{cx + r - 6},{cy + 40} q34,26 26,62"),
        "cheer": limb(ink=ink, d=f"M{cx - r + 10},{cy - 10} q-40,-30 -36,-86") + limb(ink=ink, d=f"M{cx + r - 10},{cy - 10} q40,-30 36,-86"),
        "oops": limb(ink=ink, d=f"M{cx - r + 8},{cy + 30} q-30,-10 -20,-70") + limb(ink=ink, d=f"M{cx + r - 8},{cy + 30} q30,-10 20,-70"),
        "streak": limb(ink=ink, d=f"M{cx - r + 10},{cy + 50} q-30,30 -62,34") + limb(ink=ink, d=f"M{cx + r - 6},{cy + 40} q44,6 64,-30"),
    }[name]
    if name == "cheer":   # little bursts
        extra = "".join(limb(d, ink) for d in (f"M{cx - 190},{cy - 190} l-24,-24", f"M{cx + 170},{cy - 170} l26,-26",
                                          f"M{cx - 214},{cy - 110} l-32,0", f"M{cx + 200},{cy - 100} l32,0"))
    if name == "oops":    # sweat drop
        extra = f'<path d="M{cx + 150},{cy - 150} q30,40 0,62 q-30,-22 0,-62 Z" fill="#5B9BD5"/>'
    if name == "streak":  # the logo's speed lines, and a lean into the run
        tilt = -10
        extra = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="22" rx="11" fill="{ink}"/>'
                        for x, y, w in ((22, cy - 110, 80), (6, cy - 50, 104), (34, cy + 10, 66)))
    face = eye(cx - 46, cy - 14, eyes) + eye(cx + 46, cy - 14, eyes) + mouth
    figure = f'<g transform="rotate({tilt} {cx} {cy})">{arms}{feet}{body(cx, cy, r, 1.95 * r)}{face}</g>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">{extra}{figure}</svg>\n'


if __name__ == "__main__":
    import json
    catalog = os.path.join(HERE, "Quip.xcassets")   # the same vectors for the iOS and macOS targets
    os.makedirs(catalog, exist_ok=True)
    meta = {"info": {"author": "xcode", "version": 1}}
    with open(os.path.join(catalog, "Contents.json"), "w") as f:
        json.dump(meta, f, indent=2)
    for name in ("idle", "cheer", "oops", "streak"):
        imageset = os.path.join(catalog, f"quip-{name}.imageset")
        os.makedirs(imageset, exist_ok=True)
        for suffix, ink in (("", INK), ("-dark", CREAM)):
            svg = pose(name, ink)
            for folder in (HERE, imageset):
                with open(os.path.join(folder, f"quip-{name}{suffix}.svg"), "w") as f:
                    f.write(svg)
        dark = {"appearances": [{"appearance": "luminosity", "value": "dark"}]}
        with open(os.path.join(imageset, "Contents.json"), "w") as f:
            json.dump({"images": [{"filename": f"quip-{name}.svg", "idiom": "universal"},
                                  {"filename": f"quip-{name}-dark.svg", "idiom": "universal", **dark}], **meta,
                       "properties": {"preserves-vector-representation": True}}, f, indent=2)
    print("wrote brand/quip-{idle,cheer,oops,streak}{,-dark}.svg and brand/Quip.xcassets")
