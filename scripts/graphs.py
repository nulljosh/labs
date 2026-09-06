#!/usr/bin/env python3
"""Write one commits-per-repo chart per post into _includes/graphs/.

Each post covers the days since the previous post. The chart is the same
800-wide framed card the header SVGs use, all currentColor, no <style>.
Run from deploy.sh so the numbers never go stale.
"""
import re
import subprocess
from collections import Counter
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CODE = ROOT.parent
OUT = ROOT / "_includes" / "graphs"
FIRST_START = date(2026, 2, 20)  # first header SVG; nothing older is journaled
SKIP = {"journal"}  # ponytail: the journal writing itself is not product work
TOP = 8


def commits(start, end):
    """Counter of repo -> commits and day -> commits between start and end inclusive."""
    by_repo, by_day = Counter(), Counter()
    for repo in sorted(CODE.iterdir()):
        if repo.name in SKIP or not (repo / ".git").is_dir():
            continue
        out = subprocess.run(
            ["git", "-C", str(repo), "log", "--format=%as", "--no-merges",
             f"--since={start}T00:00:00", f"--until={end}T23:59:59"],
            capture_output=True, text=True).stdout.split()
        if out:
            by_repo[repo.name] += len(out)
            by_day.update(out)
    return by_repo, by_day


def svg(title, start, end, by_repo, by_day):
    total = sum(by_repo.values())
    days = (end - start).days + 1
    t = lambda x, y, s, **k: '<text fill="currentColor" x="%d" y="%d" font-size="%s"%s>%s</text>' % (
        x, y, k.pop("size", 14), "".join(f' {a.replace("_", "-")}="{v}"' for a, v in k.items()), s)
    o = ['<svg class="post-header-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 420" width="800" height="420">',
         '<rect x="20" y="20" width="760" height="380" rx="12" ry="12" fill="none" stroke="currentColor" stroke-width="1" opacity="0.25"/>',
         t(48, 62, "work", size=12, opacity="0.6"),
         t(48, 96, "commits by project" if total else "no commits recorded", size=28, font_weight="300", letter_spacing="-0.5"),
         '<line stroke="currentColor" x1="48" y1="118" x2="752" y2="118" stroke-width="1" opacity="0.25"/>']
    top = by_repo.most_common(TOP)
    peak = top[0][1] if top else 1
    y = 146
    for name, n in top:
        w = max(4, round(340 * n / peak))
        o += [t(48, y + 11, name, size=13),
              f'<rect x="150" y="{y}" width="{w}" height="14" rx="2" fill="currentColor" opacity="0.8"/>',
              t(150 + w + 8, y + 11, n, size=12, opacity="0.6")]
        y += 26
    # daily strip: one bar per day, only worth drawing for a multi-day period
    if days > 1 and by_day:
        base, top_y, bw = 384, 340, min(12, 704 / days)
        peak_d = max(by_day.values())
        for i in range(days):
            d = (start + timedelta(days=i)).isoformat()
            h = round((base - top_y) * by_day.get(d, 0) / peak_d)
            if h:
                o.append(f'<rect x="{48 + i * bw:.1f}" y="{base - h}" width="{max(1, bw - 1):.1f}" height="{h}" fill="currentColor" opacity="0.5"/>')
        o.append(t(48, 332, f"commits per day, {days} days", size=11, opacity="0.6"))
    o += ['<rect x="560" y="136" width="200" height="180" rx="8" ry="8" fill="none" stroke="currentColor" stroke-width="1" opacity="0.25"/>',
          t(584, 166, "commits", size=12, opacity="0.6"), t(584, 198, total, size=28, font_weight="500"),
          t(584, 232, "projects touched", size=12, opacity="0.6"), t(584, 264, len(by_repo), size=28, font_weight="500"),
          t(584, 298, f"{start} to {end}" if days > 1 else str(end), size=11, opacity="0.6"),
          "</svg>"]
    return "\n".join(o) + "\n"


def main():
    OUT.mkdir(exist_ok=True)
    posts = sorted(ROOT.glob("_posts/*.md"))
    prev = FIRST_START - timedelta(days=1)
    for post in posts:
        end = date.fromisoformat(post.name[:10])
        start = prev + timedelta(days=1)
        by_repo, by_day = commits(start, end)
        title = re.search(r'^title:\s*"?([^"\n]+)', post.read_text(), re.M).group(1)
        name = post.stem + ".svg"
        (OUT / name).write_text(svg(title, start, end, by_repo, by_day))
        text = post.read_text()
        tag = "{% include graphs/" + name + " %}"
        if tag not in text:
            # right after the header include, else after front matter
            m = re.search(r"^\{% include headers/.*%\}\n", text, re.M)
            at = m.end() if m else text.find("\n---", 3) + 5
            text = text[:at] + "\n" + tag + "\n" + text[at:]
            post.write_text(text)
        print(f"{post.stem}: {start}..{end} {sum(by_repo.values())} commits, {len(by_repo)} repos")
        prev = end


if __name__ == "__main__":
    main()
