# Architecture

Authmail makes sign-in emails look like they came from the app that sent them. When someone signs up or resets a password, the login system normally sends a plain, generic email. Authmail catches that email first, works out which app it belongs to from the link inside it, dresses it in that app's name and colours, and sends it on. It is one small program running on Cloudflare's network.

## How it runs

Supabase fires a Svix webhook for auth events (signup, password reset, magic link, etc.) to `authmail.heyitsmejosh.com/<project-ref>`. The Worker verifies the Svix signature, parses the email action type, theme-matches against the redirect URL, renders branded HTML, and sends via Resend. On signup, a second welcome email is sent immediately after the confirmation email.

## Mailing list signup

Landing pages post an email to `authmail.heyitsmejosh.com/signup`. It is double opt-in, because Joshua is in Canada and CASL wants proof of consent. `POST /signup` only sends a branded "Confirm your subscription" email. The link inside, `GET /confirm?t=<token>`, only shows a Confirm button and changes nothing, so a mail scanner that fetches the link enrols nobody. The button is a `POST /confirm`, the one place a contact is created in the Resend audience "General" (id in `LIST`). The token is `base64url({e: email, t: unixSeconds, r: return URL}).HMAC-SHA256(SIGNUP_SECRET)` and lasts 48 hours. Each token has exactly one spelling, and a bad or expired link creates nothing.

- **Allow-list.** `OURS` in `src/index.js` lists the origins that may call `/signup`: `heyitsmejosh.com` and its subdomains, and `nulljosh.github.io`. It drives CORS and the `return` field, so the page that posted is the page the visitor lands back on. A domain goes in only once Joshua owns it. `jaybulb.com` is out until it is registered, because an unowned name in the list is an open redirect. Origin is spoofable, so the list is hygiene, not the gate.
- **Return URL.** It is checked at signup, signed into the token, and checked again at confirm. The mailed link carries nothing editable, and a stray `r` parameter is ignored.
- **Rate limits.** Three bindings in `wrangler.toml`. `SIGNUP_RATE_LIMITER` allows 5 requests per 10 seconds per client, keyed on the IP, or on the /64 for IPv6, with signup and confirm counted apart. `RECIPIENT_RATE_LIMITER` allows one confirm mail and one enrol per address per minute, so many IPs cannot bury one inbox or replay one token. `GLOBAL_RATE_LIMITER` caps the whole public surface at 300 a minute per location, so it cannot starve the auth hook of Resend's 10 requests a second. A missing or broken binding refuses instead of running open. Counters are per Cloudflare location, so they are a ceiling, not an exact count.
- **Responses.** Browser navigations (the no-JS form) get a redirect back with `#signed-up` or `#signup-failed`, and `#subscribed` after the confirm click. Everything else, `fetch` included, gets JSON. A Resend outage or an unexpected error gives a clean 400, 502 or 503, never an uncaught exception.
- **Re-subscribing.** Confirm looks the address up first and never writes over an existing contact, so someone who opted out stays out whatever Resend does with a duplicate. Known gap: a contact deleted from Resend inside the 48 hour window can be re-added by its old link. Closing that needs a durable used-token store.
- **Secrets.** `RESEND_API_KEY` must be a Full-access key. The contacts endpoint refuses sending-only keys. Failures are logged with `console.error` (status and body) and show up in Workers logs. `SIGNUP_SECRET` is 32 random bytes set with `wrangler secret put SIGNUP_SECRET`. Rotating it voids pending confirm links.

Tests run with `node --test`.

| File | What it owns |
|---|---|
| `src/index.js` | Svix webhook verification; per-app theme selection and email template rendering; Resend API calls for delivery (one `resend()` helper). Handles all email action types (signup, password recovery, magic link, email change, reauthentication) with type-specific copy and CTA buttons. Also owns `/signup` and `/confirm`. |
| `wrangler.toml` | Cloudflare Worker entrypoint and custom domain routing to `authmail.heyitsmejosh.com`, and the three rate limit bindings. |
| `test/signup.test.mjs` | Node tests for the signup flow: fake env, fake Resend. |
