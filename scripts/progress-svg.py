#!/usr/bin/env python3
"""Write progress.svg (lines of hand-written code over commit history) for a project.

Fleet version of joshuatree/tools/gen/progress.sh. Usage: progress-svg.py [project-dir]
"""
import re, subprocess, sys, os

os.chdir(sys.argv[1] if len(sys.argv) > 1 else ".")

CODE = (".swift", ".js", ".mjs", ".ts", ".tsx", ".jsx", ".py", ".c", ".h", ".S", ".rs", ".go",
        ".html", ".css", ".sh", ".fish", ".kt", ".sql")
SKIP = ("node_modules/", "vendor/", "dist/", "build/", ".build/", "target/", "Pods/", ".claude/",
        "DerivedData/", "xcodeproj/", ".min.", "package-lock", "screenshots/")
MAX_FILE = 5000  # ponytail: a file past this is a data blob, not hand-written; raise if a real one trips it


def git(*a):
    return subprocess.run(["git", *a], capture_output=True, text=True).stdout


def real(path):
    return path.endswith(CODE) and not any(s in path for s in SKIP)


rename = re.compile(r"^(.*)\{(.*) => (.*)\}(.*)$")
files, points, date = {}, [], None
for line in git("log", "--reverse", "--numstat", "--relative", "--pretty=format:@@%ad", "--date=short", "--", ".").split("\n"):
    if line.startswith("@@"):
        date = line[2:]
        continue
    parts = line.split("\t")
    if len(parts) != 3 or parts[0] == "-":
        continue
    m = rename.match(parts[2])
    path = m.group(1) + m.group(3) + m.group(4) if m else parts[2]
    if not real(path):
        continue
    files[path] = files.get(path, 0) + int(parts[0]) - int(parts[1])
    points.append((date, sum(v for v in files.values() if 0 < v <= MAX_FILE)))

if len(points) < 2:
    sys.exit("not enough code history to plot")

step = max(1, len(points) // 40)
pts = points[::step]
if pts[-1] != points[-1]:
    pts.append(points[-1])

n, top = len(pts), max(p[1] for p in pts) or 1
L, T, W, H = 12 + len(str(top)) * 6 + 8, 26, 420, 140
width, height = L + W + 10, T + H + 34
x = lambda i: L + i * W // (n - 1)
y = lambda v: T + H - v * H // top
months = " Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ")
short = lambda d: f"{months[int(d[5:7])]} {int(d[8:])}"
commits = git("rev-list", "--count", "HEAD", "--", ".").strip()


def doc_pct():
    # Same idea as joshuatree's progress.sh: a file is documented when docs/ARCHITECTURE.md
    # names it, or names a directory it lives in (`components/` covers everything under it).
    # Only backticked names count, so a filename that merely shows up inside a sentence earns nothing.
    try:
        arch = " ".join(re.findall(r"`([^`]+)`", open("docs/ARCHITECTURE.md").read()))
    except OSError:
        return 0
    units = [f for f in git("ls-files", ".").splitlines() if real(f)]
    hit = lambda f: f.rsplit("/", 1)[-1] in arch or any(d + "/" in arch for d in f.split("/")[:-1])
    if "--missing" in sys.argv:  # list what the doc still has to cover
        print("\n".join(f for f in units if not hit(f)))
    return sum(map(hit, units)) * 100 // len(units) if units else 0


docs = doc_pct()

ticks = "".join(
    f'<line x1="{L}" y1="{y(v)}" x2="{L+W}" y2="{y(v)}" class="g"/>'
    f'<text x="{L-4}" y="{y(v)+3}" font-size="9" text-anchor="end">{v}</text>' for v in (top, top // 2))
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}"><style>
  :root {{ --ink: #111111; }}
  @media (prefers-color-scheme: dark) {{ :root {{ --ink: #ececec; }} }}
  text {{ font-family: -apple-system, Helvetica, Arial, sans-serif; fill: var(--ink); }}
  line, polyline {{ stroke: var(--ink); fill: none; }}
  .g {{ stroke-dasharray: 1 4; }}
</style><text x="{L}" y="11" font-size="10">Lines of real code</text>{ticks}
<line x1="{L}" y1="{T}" x2="{L}" y2="{T+H}"/><line x1="{L}" y1="{T+H}" x2="{L+W}" y2="{T+H}"/>
<polyline points="{" ".join(f"{x(i)},{y(p[1])}" for i, p in enumerate(pts))}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
<text x="{L}" y="{T+H+16}" font-size="10">{short(pts[0][0])}</text><text x="{L+W}" y="{T+H+16}" font-size="10" text-anchor="end">{short(pts[-1][0])}</text>
<text x="{L}" y="{height-4}" font-size="10" font-weight="600">{pts[-1][1]:,} lines &#183; {docs}% documented &#183; {commits} commits since {short(points[0][0])} {points[0][0][:4]}</text></svg>
'''
open("progress.svg", "w").write(svg)
print(f"{os.path.basename(os.getcwd())}: {pts[-1][1]:,} lines, {docs}% documented, {commits} commits")
