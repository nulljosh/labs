# bank roadmap

## WebMCP + REST API rollout (pending, 2026-08-27)

Add `document.modelContext` tool registration so in-browser agents can drive
this app, and document any HTTP surface it already has.

Pattern is already shipped in epiphany, healstack, roost, curvely, wiretext,
litigate, cadence, sparkjar and lexly — copy the closest one:

- React app with hooks → `src/lib/webmcp.js` exporting `useWebMCP(ctx)`, called
  from `App.jsx` with the hook callbacks it already holds (see epiphany, curvely).
- React app whose state lives in contexts → a `<WebMCP />` component that reads
  those contexts (see healstack, roost).
- Vanilla JS app → a `webmcp.js` IIFE plus `window.*` accessors exported from the
  existing app script (see litigate, lexly, sparkjar).

Rules the shipped ones follow:
- Tools call existing functions or existing `/api` routes. Never reimplement logic.
- Read-only tools first, then reversible writes.
- `requiresConfirmation: true` only on the genuinely consequential ones —
  payments, public publishing, deletions. Not on ordinary writes.
- Bail out quietly when `document.modelContext` is missing.
- Ship a `docs/API.md` listing REST routes (or stating there are none) plus the
  tool table split into read-only / reversible / confirmation-gated.
