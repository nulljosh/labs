# Architecture

Supabase auth email hook → branded email sender via Resend. A Cloudflare Worker that intercepts Supabase authentication emails, applies app-specific branding based on the redirect URL, and dispatches them through Resend's API.

## How it runs

Supabase fires a Svix webhook for auth events (signup, password reset, magic link, etc.) to `authmail.heyitsmejosh.com/<project-ref>`. The Worker verifies the Svix signature, parses the email action type, theme-matches against the redirect URL, renders branded HTML, and sends via Resend. On signup, a second welcome email is sent immediately after the confirmation email.

| File | What it owns |
|---|---|
| `src/index.js` | Svix webhook verification; per-app theme selection and email template rendering; Resend API calls for delivery. Handles all email action types (signup, password recovery, magic link, email change, reauthentication) with type-specific copy and CTA buttons. |
| `wrangler.toml` | Cloudflare Worker entrypoint and custom domain routing to `authmail.heyitsmejosh.com`. |
