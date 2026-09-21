#!/usr/bin/env python3
"""Print a cheap digest of a repo's code files so a doc writer doesn't have to read every file.

Usage: doc-digest.py [project-dir]. Per file: path, line count, leading comment/first lines, top-level names.
"""
import os, re, subprocess, sys

os.chdir(sys.argv[1] if len(sys.argv) > 1 else ".")
CODE = (".swift", ".js", ".mjs", ".ts", ".tsx", ".jsx", ".py", ".c", ".h", ".S", ".rs", ".go",
        ".html", ".css", ".sh", ".fish", ".kt", ".sql")
SKIP = ("node_modules/", "vendor/", "dist/", "build/", ".build/", "target/", "Pods/", ".claude/",
        "DerivedData/", "xcodeproj/", ".min.", "package-lock", "screenshots/")  # keep in step with progress-svg.py
NAME = re.compile(r"^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:public\s+|private\s+|final\s+|static\s+)*"
                  r"(?:function|class|struct|enum|protocol|extension|func|def|fn|const|interface|type|CREATE TABLE)\s+([A-Za-z_][\w.]*)")

files = [f for f in subprocess.run(["git", "ls-files", "."], capture_output=True, text=True).stdout.splitlines()
         if f.endswith(CODE) and not any(s in f for s in SKIP)]
by_dir = {}
for f in files:
    by_dir.setdefault(os.path.dirname(f) or ".", []).append(f)
for d, fs in sorted(by_dir.items()):
    print(f"\n## {d}/ ({len(fs)} files)")
    for f in fs:
        try:
            lines = open(f, errors="replace").read().splitlines()
        except OSError:
            continue
        head = " | ".join(l.strip()[:110] for l in lines[:40] if l.strip())[:330]
        names = list(dict.fromkeys(m.group(1) for l in lines if (m := NAME.match(l))))[:14]
        print(f"- {f} ({len(lines)}L) names: {', '.join(names) or '-'}\n    {head}")
