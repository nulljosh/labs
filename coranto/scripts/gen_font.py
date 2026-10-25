"""Coranto Sans and Coranto Display: Archivo and Archivo Narrow (Omnibus-Type, SIL Open Font License 1.1, no reserved
name), renamed.

Archivo is drawn after the late 1800s American grotesques that newspapers set their headlines in, which is what a
coranto was: the first running news sheet. Sans for reading, Narrow Bold for headlines and labels. Same method as
Talli Display and Coda's Quip Sans: pinned release, renamed, OFL shipped beside the fonts, original copyright kept in
the name table. Latin only, web only for now (the apps stay on SF until a build bundles it), every build the same bytes.

    uv run --with fonttools --with brotli python3 scripts/gen_font.py           # web/fonts/*.woff2 + OFL.txt
    uv run --with fonttools --with brotli python3 scripts/gen_font.py --check   # named Coranto, OFL present
"""
import io
import os
import sys
import urllib.request

from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEB = os.path.join(HERE, "web", "fonts")
CDN = "https://cdn.jsdelivr.net/npm/@fontsource/"
OFL = "https://raw.githubusercontent.com/google/fonts/main/ofl/archivo/OFL.txt"
# family, style, weight, source file
FACES = [
    ("Coranto Sans", "Regular", 400, "archivo@5.2.5/files/archivo-latin-400-normal.woff2"),
    ("Coranto Sans", "Medium", 500, "archivo@5.2.5/files/archivo-latin-500-normal.woff2"),
    ("Coranto Sans", "Semibold", 600, "archivo@5.2.5/files/archivo-latin-600-normal.woff2"),
    ("Coranto Sans", "Bold", 700, "archivo@5.2.5/files/archivo-latin-700-normal.woff2"),
    ("Coranto Display", "Bold", 700, "archivo-narrow@5.2.5/files/archivo-narrow-latin-700-normal.woff2"),
]


def fetch(url):
    """Bytes of one pinned file."""
    with urllib.request.urlopen(url, timeout=60) as r:
        return r.read()


def file_name(family, style):
    return family.replace(" ", "") + "-" + style


def rename(font, family, style):
    """Give the outlines the Coranto name; copyright (0) and license (13, 14) stay as the authors wrote them."""
    ps = file_name(family, style)
    names = {1: family, 2: style, 3: ps, 4: f"{family} {style}", 5: "Version 1.000", 6: ps, 16: family, 17: style}
    table = font["name"]
    table.names = [n for n in table.names if n.nameID in (0, 13, 14)]
    for nid, text in names.items():
        table.setName(text, nid, 3, 1, 0x409)
        table.setName(text, nid, 1, 0, 0)
    font["head"].created = font["head"].modified = 3_700_000_000   # fixed, so every build is the same bytes
    font["OS/2"].achVendID = "CRNT"


def check():
    """Self-check of the shipped files."""
    assert os.path.exists(os.path.join(WEB, "OFL.txt")), "the OFL must ship with the fonts"
    assert "Archivo" in open(os.path.join(WEB, "OFL.txt")).read(), "OFL must carry the Archivo copyright"
    for family, style, _, _ in FACES:
        f = TTFont(os.path.join(WEB, file_name(family, style) + ".woff2"))
        assert f["name"].getDebugName(1) == family and f["name"].getDebugName(6) == file_name(family, style)
        assert "Archivo" in f["name"].getDebugName(0), "original copyright must stay in the name table"
    print("font ok: Coranto Sans and Coranto Display (Archivo, OFL)")


def main():
    """Fetch Archivo, rename it, write the web files and the license."""
    if "--check" in sys.argv:
        return check()
    os.makedirs(WEB, exist_ok=True)
    for family, style, _, src in FACES:
        font = TTFont(io.BytesIO(fetch(CDN + src)))
        rename(font, family, style)
        font.flavor = "woff2"
        font.save(os.path.join(WEB, file_name(family, style) + ".woff2"), reorderTables=False)
        print(file_name(family, style))
    with open(os.path.join(WEB, "OFL.txt"), "wb") as f:
        f.write(fetch(OFL))


if __name__ == "__main__":
    main()
