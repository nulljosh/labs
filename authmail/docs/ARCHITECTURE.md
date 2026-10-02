# Architecture

Authmail makes sign-in emails look like they came from the app that sent them. When someone signs up or resets a password, the login system normally sends a plain, generic email. Authmail catches that email first, works out which app it belongs to from the link inside it, dresses it in that app's name and colours, and sends it on. It is one small program running on Cloudflare's network.

## How it runs

Supabase fires a Svix webhook for auth events (signup, password reset, magic link, etc.) to `authmail.heyitsmejosh.com/<project-ref>`. The Worker verifies the Svix signature, parses the email action type, theme-matches against the redirect URL, renders branded HTML, and sends via Resend. On signup, a second welcome email is sent immediately after the confirmation email.

## Mailing list signup

Landing pages post an email to `authmail.heyitsmejosh.com/signup`. It is double opt-in, because Joshua is in Canada and CASL wants proof of consent. `POST /signup` only sends a branded "Confirm your subscription" email. The link inside, `GET /confirm?t=<token>`, is the one place a contact is created in the Resend audience "General" (id in `LIST`). The token is `base64url(email.unixSeconds).HMAC-SHA256(SIGNUP_SECRET)` and lasts 48 hours. A bad or expired link creates nothing.

- **Allow-list.** `OURS` in `src/index.js` lists the origins that may call `/signup`: `heyitsmejosh.com`, `jaybulb.com`, `nulljosh.github.io` and their subdomains. It drives CORS and the `return` field, so the page that posted is the page the visitor lands back on. Origin is spoofable, so it is hygiene, not the gate. The gates are consent, the hidden `website` honeypot and the rate limit.
- **Rate limit.** The `SIGNUP_RATE_LIMITER` binding allows 5 requests per 10 seconds per IP. If the binding is missing, signup refuses instead of running open.
- **Responses.** Browser navigations (the no-JS form) get a redirect back with `#signed-up` or `#signup-failed`, and `#subscribed` after the confirm click. Everything else, `fetch` included, gets JSON.
- **Re-subscribing.** The contact is created without an `unsubscribed` field, so someone who opted out stays out. An "already exists" answer from Resend counts as success.
- **Secrets.** `RESEND_API_KEY` must be a Full-access key. The contacts endpoint refuses sending-only keys. Failures are logged with `console.error` (status and body) and show up in Workers logs. `SIGNUP_SECRET` is 32 random bytes set with `wrangler secret put SIGNUP_SECRET`. Rotating it voids pending confirm links.

Tests run with `node --test`.

| File | What it owns |
|---|---|
| `src/index.js` | Svix webhook verification; per-app theme selection and email template rendering; Resend API calls for delivery (one `resend()` helper). Handles all email action types (signup, password recovery, magic link, email change, reauthentication) with type-specific copy and CTA buttons. Also owns `/signup` and `/confirm`. |
| `wrangler.toml` | Cloudflare Worker entrypoint and custom domain routing to `authmail.heyitsmejosh.com`, and the `SIGNUP_RATE_LIMITER` binding. |
| `test/signup.test.mjs` | Node tests for the signup flow: fake env, fake Resend. |
