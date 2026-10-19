"""Quip, the Coda mascot: the logo's opening quote mark come to life. The ball is the body, the tail is
its cowlick. Flat two-tone (marquee yellow, night ink), no text, four poses.

    python3 brand/mascot.py   # writes brand/quip-{pose}.svg, a -dark twin for dark grounds, and brand/Quip.xcassets
"""
import os

YELLOW, INK, SNOW = "#ffcc00", "#15161a", "#f5f5f7"
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


# Outfits (v66): flat ink and yellow like Quip itself, drawn in the figure's frame so they lean with it.
# Hats and headphones take the limb ink so they read on the dark ground; bowtie and shades sit on
# the yellow and stay ink. The ball's top sits at (256, 198); the cowlick rises to the right, so hats sit left of it.
OUTFITS = ("bowtie", "headphones", "beret", "tophat", "shades", "mortarboard", "partyhat")


def outfit(name, cx, cy, r, ink):
    top = cy - r
    if name == "bowtie":
        y = cy + r - 26
        return (f'<path d="M{cx - 44},{y - 20} L{cx - 6},{y} L{cx - 44},{y + 20} Z M{cx + 44},{y - 20} L{cx + 6},{y} L{cx + 44},{y + 20} Z" fill="{INK}"/>'
                f'<circle cx="{cx}" cy="{y}" r="11" fill="{INK}"/>')
    if name == "headphones":
        return (f'<path d="M{cx - r - 4},{cy - 10} A{r + 4},{r + 4} 0 0 1 {cx + r + 4},{cy - 10}" stroke="{ink}" stroke-width="16" fill="none"/>'
                f'<rect x="{cx - r - 26}" y="{cy - 40}" width="34" height="70" rx="14" fill="{ink}"/>'
                f'<rect x="{cx + r - 8}" y="{cy - 40}" width="34" height="70" rx="14" fill="{ink}"/>')
    if name == "beret":
        return (f'<ellipse cx="{cx - 40}" cy="{top + 14}" rx="96" ry="34" fill="{ink}" transform="rotate(-12 {cx - 40} {top + 14})"/>'
                f'<rect x="{cx - 46}" y="{top - 30}" width="12" height="20" rx="6" fill="{ink}"/>')
    if name == "tophat":
        x = cx - 60
        return (f'<rect x="{x - 56}" y="{top - 2}" width="152" height="22" rx="10" fill="{ink}" transform="rotate(-10 {x + 20} {top})"/>'
                f'<rect x="{x - 26}" y="{top - 112}" width="92" height="112" rx="10" fill="{ink}" transform="rotate(-10 {x + 20} {top})"/>'
                f'<rect x="{x - 26}" y="{top - 30}" width="92" height="18" fill="{YELLOW}" transform="rotate(-10 {x + 20} {top})"/>')
    if name == "shades":
        y = cy - 14
        return (f'<rect x="{cx - 82}" y="{y - 24}" width="72" height="46" rx="18" fill="{ink}"/>'
                f'<rect x="{cx + 10}" y="{y - 24}" width="72" height="46" rx="18" fill="{ink}"/>'
                f'<path d="M{cx - 10},{y - 6} L{cx + 10},{y - 6}" stroke="{ink}" stroke-width="10"/>'
                f'<path d="M{cx - 70},{y - 12} l18,0" stroke="#fff" stroke-width="7" stroke-linecap="round"/>')
    if name == "mortarboard":
        x = cx - 50
        return (f'<path d="M{x - 92},{top - 6} L{x},{top - 46} L{x + 92},{top - 6} L{x},{top + 30} Z" fill="{ink}"/>'
                f'<rect x="{x - 46}" y="{top}" width="92" height="30" rx="8" fill="{ink}"/>'
                f'<path d="M{x},{top - 8} L{x + 70},{top + 10} L{x + 70},{top + 60}" stroke="{YELLOW}" stroke-width="7" fill="none" stroke-linecap="round"/>')
    if name == "partyhat":   # v100: Quip's birthday, October 18; worn by everyone's Quip that day
        x = cx - 58
        rot = f'transform="rotate(-14 {x} {top})"'
        return (f'<path d="M{x - 46},{top + 8} L{x},{top - 118} L{x + 46},{top + 8} Z" fill="{ink}" {rot}/>'
                f'<path d="M{x - 31},{top - 34} L{x + 31},{top - 34} M{x - 17},{top - 72} L{x + 17},{top - 72}" stroke="{YELLOW}" stroke-width="12" {rot}/>'
                f'<circle cx="{x}" cy="{top - 122}" r="16" fill="#ff6fae" {rot}/>')
    return ""


def limb(d, ink=INK):
    return f'<path d="{d}" stroke="{ink}" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'


def pose(name, ink=INK, wear=None):
    """ink colours the limbs, feet and motion marks: night ink on light grounds, soft white on dark ones.
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
    dress = outfit(wear, cx, cy, r, ink) if wear else ""
    figure = f'<g transform="rotate({tilt} {cx} {cy})">{arms}{feet}{body(cx, cy, r, 1.95 * r)}{face}{dress}</g>'
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
        for suffix, ink in (("", INK), ("-dark", SNOW)):
            svg = pose(name, ink)
            for folder in (HERE, imageset):
                with open(os.path.join(folder, f"quip-{name}{suffix}.svg"), "w") as f:
                    f.write(svg)
        dark = {"appearances": [{"appearance": "luminosity", "value": "dark"}]}
        with open(os.path.join(imageset, "Contents.json"), "w") as f:
            json.dump({"images": [{"filename": f"quip-{name}.svg", "idiom": "universal"},
                                  {"filename": f"quip-{name}-dark.svg", "idiom": "universal", **dark}], **meta,
                       "properties": {"preserves-vector-representation": True}}, f, indent=2)
    # Outfits: web only for now, brand/outfits/quip-{pose}-{outfit}{,-dark}.svg
    os.makedirs(os.path.join(HERE, "outfits"), exist_ok=True)
    for name in ("idle", "cheer", "oops", "streak"):
        for wear in OUTFITS:
            for suffix, ink in (("", INK), ("-dark", SNOW)):
                with open(os.path.join(HERE, "outfits", f"quip-{name}-{wear}{suffix}.svg"), "w") as f:
                    f.write(pose(name, ink, wear))
    print("wrote brand/quip-{idle,cheer,oops,streak}{,-dark}.svg, brand/Quip.xcassets and brand/outfits/")
