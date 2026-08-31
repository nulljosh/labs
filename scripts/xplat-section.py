#!/usr/bin/env python3
"""Add an "Install it anywhere" section to an app's landing page.

ponytail: one generator, one snippet, scoped styles with token fallbacks -- so it
inherits each site's palette instead of forcing 14 bespoke sections.

  xplat-section.py --file landing/index.html --name Curvely \
      --app https://curvely.heyitsmejosh.com/app --asc 6794988370 [--mac-release <url>]

Idempotent: a page that already has #install-anywhere is left alone.
"""
import argparse, re, sys

CSS = """
<style>
#install-anywhere{padding:5rem 0;border-top:1px solid color-mix(in srgb, currentColor 14%, transparent);}
#install-anywhere .xp-wrap{max-width:960px;margin:0 auto;padding:0 1.5rem;}
#install-anywhere h2{font-size:clamp(1.6rem,3.4vw,2.4rem);margin:0 0 .6rem;letter-spacing:-.02em;}
#install-anywhere .xp-lead{max-width:46ch;margin:0 0 2.5rem;opacity:.7;line-height:1.55;}
#install-anywhere .xp-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));}
#install-anywhere .xp-card{background:color-mix(in srgb, currentColor 4%, transparent);border:1px solid color-mix(in srgb, currentColor 14%, transparent);border-radius:12px;padding:1.25rem;display:flex;flex-direction:column;gap:.5rem;}
#install-anywhere .xp-card h3{margin:0;font-size:1rem;letter-spacing:-.01em;}
#install-anywhere .xp-card p{margin:0;font-size:.9rem;line-height:1.5;opacity:.7;flex:1;}
#install-anywhere .xp-card a{margin-top:.5rem;font-size:.875rem;font-weight:500;color:var(--accent,currentColor);text-decoration:none;}
#install-anywhere .xp-card a:hover{text-decoration:underline;}
</style>
"""

def card(title, body, link=None, label=None):
    a = f'\n      <a href="{link}">{label} &rarr;</a>' if link else ""
    return f'    <div class="xp-card">\n      <h3>{title}</h3>\n      <p>{body}</p>{a}\n    </div>'

def build(name, app, asc, mac_release, has_ios, has_mac):
    store = f"https://apps.apple.com/app/id{asc}" if asc else None
    cards = []
    if has_ios:
        cards.append(card("iPhone &amp; iPad", f"A native app, not a wrapped web page.",
                          store, "App Store") if store else
                     card("iPhone &amp; iPad", "A native SwiftUI app."))
    if has_mac:
        cards.append(card("Mac", "Native, universal binary. Runs on Apple silicon and Intel.",
                          store or mac_release, "App Store" if store else "Download"))
    cards.append(card("Windows", f"Open the web app in Edge or Chrome, then <strong>Install {name}</strong> from the address bar. It lands in the Start Menu like any other app.", app, "Open &amp; install"))
    cards.append(card("Android", "Open the web app in Chrome, then <strong>Add to Home screen</strong>. Full screen, no browser chrome, works offline.", app, "Open &amp; install"))
    cards.append(card("Linux", "Same as Windows &mdash; install the web app from Chrome or Chromium and it runs in its own window.", app, "Open &amp; install"))
    cards.append(card("Web", "Nothing to install. The same app, in any modern browser.", app, "Open the web app"))
    return (CSS + f"""
<section id="install-anywhere">
  <div class="xp-wrap">
    <h2>Install it anywhere.</h2>
    <p class="xp-lead">{name} runs on every platform. On Windows, Linux and Android it installs straight from the browser &mdash; no store, no download, no runtime. It gets a real window, its own icon, and keeps working offline.</p>
    <div class="xp-grid">
{chr(10).join(cards)}
    </div>
  </div>
</section>
""")

ap = argparse.ArgumentParser()
ap.add_argument("--file", required=True)
ap.add_argument("--name", required=True)
ap.add_argument("--app", required=True)
ap.add_argument("--asc")
ap.add_argument("--mac-release")
ap.add_argument("--no-ios", action="store_true")
ap.add_argument("--no-mac", action="store_true")
a = ap.parse_args()

html = open(a.file).read()
if "install-anywhere" in html:
    print(f"skip (already present): {a.file}"); sys.exit(0)

section = build(a.name, a.app, a.asc, a.mac_release, not a.no_ios, not a.no_mac)

# Sit above the footer when there is one; otherwise last thing in the body.
m = re.search(r'\n[^\n]*<footer', html)
if m:
    html = html[:m.start()] + "\n" + section + html[m.start():]
elif "</body>" in html:
    html = html.replace("</body>", section + "</body>", 1)
else:
    html += section
open(a.file, "w").write(html)
print(f"added install-anywhere: {a.file}")
