# Homeqi Technical Whitepaper

**v1.0** | August 2026

Is the place you live any good? A book answers that question but takes hours to
read and offers no way to check a specific room against it. Homeqi condenses
Eva Wong's *Good Fengshui* into a reader and a 24-question assessment that work
offline, so the same reference material a book gives you becomes something you
can actually check your home against. Web plus a native SwiftUI iOS app.

## Problem

Reference material like this is read in short, repeated visits: look up one
principle, close the app. That rules out anything with a login, a network round
trip, or a loading state. The whole book is small enough to ship as text, so it is.

## Content model

`content.md` is the single source of truth: one Markdown file, chapters delimited by
headings, because the content is a finished book, not something that needs editorial
tooling built around it. The web reader and the iOS app both parse that same file, so a
content edit is one commit and both platforms move together. There is no CMS, no
database, and no content API, since none of that machinery earns its keep for static
text that rarely changes.

## Web

`index.html` is a static chapter reader with a sidebar table of contents, the same
viewer pattern used by [uprighty](https://github.com/nulljosh/uprighty). It parses
`content.md` at load, builds the TOC from the heading structure, and renders inline.
No build step and no framework.

## iOS

`ios/Homeqi` is a native SwiftUI app: a chapter list backed by `content.md`
bundled into the app, rendered inline. No backend, so it works fully offline
(the whole point, since this gets opened in a room being assessed, not
necessarily somewhere with signal) and has no failure mode beyond the app itself.

## Design decisions

- **One content file, two renderers.** The alternative, per-platform content, is
  the failure mode where the app and the site drift apart.
- **Ship the text, not a fetch.** Bundling the content removes the network from the
  read path entirely.
- **No accounts.** Nothing here is personal, so nothing needs to be stored.

## License

MIT 2026, Joshua Trommel
