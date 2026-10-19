#!/usr/bin/env python3
"""Gate on the post rules in CLAUDE.md so a bloated entry cannot deploy.

The 350-word cap and the no-hashes/no-build-numbers rules already lived in
CLAUDE.md and the journal skill and were ignored twice, so they are checked
mechanically here instead of restated in prose.
"""
import re
import sys
from pathlib import Path

# Daily entries are a recap; a monthly wrap legitimately covers more ground.
WORD_CAP = 350
MONTHLY_CAP = 500
# A quarterly wrap replaces ten short entries, so it gets ten short entries worth.
QUARTERLY_CAP = 1200
SENTENCE_CAP = 5

WEEKDAYS = ("monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday")

# ponytail: one regex per rule, message carries the fix. Add a rule by adding a row.
BANNED = [
    (re.compile(r"\b(?=[0-9a-f]*[a-f])[0-9a-f]{7,40}\b"), "commit hash"),
    (re.compile(r"\bv?\d+\.\d+\.\d+\b"), "version number"),
    (re.compile(r"\b20\d{10}\b"), "build number"),
    (re.compile(r"—"), "em dash"),
    (re.compile("[\U0001F300-\U0001FAFF☀-➿]"), "emoji"),
]


def strip_frontmatter(text):
    """Return (body, line_offset) with leading YAML frontmatter removed."""
    if not text.startswith("---"):
        return text, 0
    end = text.find("\n---", 3)
    if end == -1:
        return text, 0
    body = text[end + 4:]
    return body, text[: end + 4].count("\n") + 1


def count_sentences(text):
    text = re.sub(r"`[^`]*`", "", text)
    return len([s for s in re.split(r"[.!?]+(?:\s|$)", text) if s.strip()])


def check(path):
    """Yield human-readable violations for one post."""
    raw = path.read_text(encoding="utf-8")
    body, offset = strip_frontmatter(raw)
    out = []

    if re.search(r"^categories:.*\bquarterly\b", raw, re.M):
        cap = QUARTERLY_CAP
    elif re.search(r"^categories:.*\bmonthly\b", raw, re.M):
        cap = MONTHLY_CAP
    else:
        cap = WORD_CAP
    words = len(re.sub(r"\{%.*?%\}", "", body).split())
    if words > cap:
        out.append(f"{path.name}: {words} words, cap is {cap} (cut {words - cap})")

    for i, line in enumerate(body.splitlines(), start=offset + 1):
        if line.lstrip().startswith(("|", ">")) or line.startswith("    "):
            continue
        for pattern, label in BANNED:
            m = pattern.search(line)
            # A lone "20260818"-style date inside a heading is fine; hashes are not.
            if m:
                out.append(f"{path.name}:{i}: {label} {m.group(0)!r}")

    # Split into ## sections and check each day section's shape.
    sections = re.split(r"^## +", body, flags=re.M)[1:]
    seen_days = {}
    for sec in sections:
        heading = sec.splitlines()[0].strip()
        rest = "\n".join(sec.splitlines()[1:])
        low = heading.lower()

        day = next((d for d in WEEKDAYS if d in low), None)
        if day:
            seen_days[day] = seen_days.get(day, 0) + 1
            n = count_sentences(rest)
            if n > SENTENCE_CAP:
                out.append(f"{path.name}: '{heading}' has {n} sentences, cap is {SENTENCE_CAP}")
            for line in rest.splitlines():
                if re.match(r"\s*(?:[-*+]|\d+\.)\s+", line):
                    out.append(f"{path.name}: '{heading}' has a list; day sections are prose only")
                    break

    for day, n in seen_days.items():
        if n > 1:
            out.append(f"{path.name}: {n} headings for {day}; use one heading per day")

    return out


GOOD = """---
title: "Test"
---

## Monday (August 3)

I fixed the login page. It had been redirecting people back to itself.
"""

BAD = """---
title: "Test"
---

## Monday (August 3)

Shipped commit a1b2c3d bumping to v1.2.0 — see below.

- did a thing

## Monday (later)

More.
"""


def selftest():
    import tempfile

    with tempfile.TemporaryDirectory() as d:
        good = Path(d) / "good.md"
        good.write_text(GOOD)
        assert check(good) == [], check(good)

        bad = Path(d) / "bad.md"
        bad.write_text(BAD)
        found = " ".join(check(bad))
        for expected in ["commit hash", "version number", "em dash", "list", "headings for monday"]:
            assert expected in found, f"missed {expected}: {found}"

        big = Path(d) / "big.md"
        big.write_text("---\ntitle: x\n---\n\n## Monday\n\n" + "word " * 400)
        assert "cap is 350" in " ".join(check(big))
    print("selftest ok")


def main():
    if "--selftest" in sys.argv:
        selftest()
        return 0

    posts = sorted((Path(__file__).resolve().parent.parent / "_posts").glob("*.md"))
    violations = [v for p in posts for v in check(p)]
    if violations:
        print(f"{len(violations)} violation(s) in {len(posts)} posts:\n", file=sys.stderr)
        for v in violations:
            print(f"  {v}", file=sys.stderr)
        print("\nSee CLAUDE.md: ~350 words, 2-4 sentences a day, no hashes or build numbers.", file=sys.stderr)
        return 1
    print(f"{len(posts)} posts ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
