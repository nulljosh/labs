// Supabase "Send Email" auth hook → branded email per app via Resend.
// Both Supabase projects point here; the project ref is the URL path.
// ponytail: theme is a static map keyed on the redirect URL. Add a row per app, nothing else.

const THEMES = {
  lexly:     { name: "Lexly",           accent: "#5B9BD5", match: ["lexly", "lingo"] },
  healstack: { name: "Healstack",       accent: "#5B9BD5", match: ["healstack", "dose"] },
  litigate:  { name: "Litigate",        accent: "#1F3A5F", match: ["litigate"] },
  homeward:  { name: "Homeward",        accent: "#FF851B", match: ["homeward", "pets"] },
  bookrank:  { name: "Bookrank",        accent: "#5B9BD5", match: ["bookrank"], icon: "https://bookrank.heyitsmejosh.com/icon-192.png" },
  bcgd:      { name: "BC Garage Doors", accent: "#B4661C", match: ["bcgd", "doorstock"] },
  roost:     { name: "Roost",           accent: "#2E7D32", match: ["roost"] },
  stanza:    { name: "Stanza",          accent: "#171717", match: ["stanza"] },
  quotestreak: { name: "Quotestreak",   accent: "#5B9BD5", match: ["quotestreak", "quotable"] },
  sparkjar:  { name: "Sparkjar",        accent: "#3B82F6", match: ["spark"] },
};
const DEFAULT = { name: "heyitsmejosh", accent: "#111111" };

const SUBJECT = {
  signup: "Confirm your email",
  recovery: "Reset your password",
  magiclink: "Your sign-in link",
  invite: "You have been invited",
  email_change: "Confirm your new email",
  reauthentication: "Your verification code",
  welcome: "Welcome",
};
const BODY = {
  signup: "Tap the button to confirm your email and activate your account.",
  recovery: "Tap the button to choose a new password. If you did not ask for this, ignore this email.",
  magiclink: "Tap the button to sign in.",
  invite: "You have been invited. Tap the button to accept and create your account.",
  email_change: "Tap the button to confirm your new email address.",
  reauthentication: "Enter this code to continue:",
  welcome: "Your account is confirmed. Glad to have you.",
};

function themeFor(redirectTo = "") {
  const r = redirectTo.toLowerCase();
  for (const t of Object.values(THEMES)) if (t.match.some((m) => r.includes(m))) return t;
  return DEFAULT;
}

// House email style (same paper, ink and pill as the Joshua Tree waitlist mail): cream sheet,
// near-black type, one accent pill, SF/Helvetica, short plain sentences. Dark mode flips the
// sheet, not the accent. The button text picks ink or white by the accent's own brightness.
function ink(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b > 130 ? "#1A1814" : "#FFFFFF";
}

function html(t, type, link, token) {
  const title = SUBJECT[type] || "Continue";
  const ctaLabel = type === "welcome" ? `Open ${t.name}` : title;
  const cta = type === "reauthentication"
    ? `<p style="font-size:30px;letter-spacing:8px;font-weight:600;margin:28px 0">${token}</p>`
    : `<p style="margin:28px 0"><a href="${link}" style="display:inline-block;background:${t.accent};color:${ink(t.accent)};text-decoration:none;font-weight:600;font-size:16px;padding:13px 26px;border-radius:999px">${ctaLabel}</a></p>`;
  const fallback = type === "reauthentication" || type === "welcome" ? "" :
    `<p class="mute" style="font-size:13px;line-height:1.55;color:#6F675C;margin:0 0 20px">This link works once and expires in one hour. If the button does not open, copy this into your browser:<br><span style="word-break:break-all">${link}</span></p>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>${title} · ${t.name}</title>
<style>@media (prefers-color-scheme:dark){body,.bg{background:#14120F!important}.sheet{background:#1D1A16!important;border-color:#2E2A24!important}.rule{border-color:#2E2A24!important}.ink{color:#F4EEE3!important}.mute{color:#A59C8C!important}}</style></head>
<body class="bg" style="margin:0;background:#F4EEE3;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',Helvetica,Arial,sans-serif;color:#1A1814;-webkit-font-smoothing:antialiased">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="sheet" style="max-width:520px;background:#FBF8F1;border:1px solid #E2D9C6;border-radius:14px"><tr><td style="padding:36px 32px">
<p class="ink" style="font-size:15px;font-weight:600;letter-spacing:.01em;margin:0 0 28px;color:#1A1814">${t.icon ? `<img src="${t.icon}" width="28" height="28" alt="" style="vertical-align:middle;border-radius:7px;margin-right:10px;border:0">` : ""}<span style="vertical-align:middle">${t.name}</span></p>
<h1 class="ink" style="font-size:28px;line-height:1.15;font-weight:600;letter-spacing:-.02em;margin:0 0 14px;color:#1A1814">${title}</h1>
<p class="ink" style="font-size:16px;line-height:1.55;margin:0;color:#1A1814">${BODY[type] || ""}</p>
${cta}${fallback}
<p class="mute rule" style="font-size:13px;line-height:1.55;color:#6F675C;margin:0;border-top:1px solid #E2D9C6;padding-top:18px">Sent by ${t.name}. If you did not ask for this email, you can ignore it.</p>
</td></tr></table></td></tr></table></body></html>`;
}

function text(t, type, link, token) {
  const body = BODY[type] || "";
  const action = type === "reauthentication" ? token : type === "welcome" ? "" : link;
  return `${t.name}\n\n${SUBJECT[type] || "Continue"}\n\n${body}${action ? `\n\n${action}` : ""}\n\nSent by ${t.name}. If you did not ask for this email, you can ignore it.\n`;
}

// Svix webhook verification (what Supabase auth hooks use): secret is base64
// after the "whsec_" prefix, the signed payload is "id.timestamp.body", and
// the header can carry multiple "v1,<sig>" pairs (key rotation) so we accept
// any match rather than just the first.
async function verify(req, body, secret) {
  const id = req.headers.get("webhook-id"), ts = req.headers.get("webhook-timestamp"), sigs = req.headers.get("webhook-signature") || "";
  if (!id || !ts || !sigs) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;
  const raw = Uint8Array.from(atob(secret.split("whsec_")[1]), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${ts}.${body}`));
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));
  return sigs.split(" ").some((s) => s.split(",")[1] === expected);
}

function send(env, t, type, to, link, token) {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `${t.name} <noreply@heyitsmejosh.com>`,
      to: [to],
      subject: `${SUBJECT[type] || "Continue"} · ${t.name}`,
      html: html(t, type, link, token),
      text: text(t, type, link, token),
    }),
  });
}

// Landing-page email capture → Resend audience. Plain form POST (works without JS) or fetch.
// ponytail: honeypot + origin check, no rate limit. Add Turnstile if bots show up in the audience.
// ponytail: one list. Joshua Tree's hardware waitlist lives in its own Worker's KV.
const LIST = "154529c4-2064-4a20-876e-7a8269371987"; // Resend "General": new apps and updates
const OURS = /^https:\/\/([a-z0-9-]+\.)*(heyitsmejosh\.com|jaybulb\.com|nulljosh\.github\.io)$/;

async function signup(req, env) {
  const origin = req.headers.get("origin") || "";
  const cors = OURS.test(origin) ? { "Access-Control-Allow-Origin": origin } : {};
  if (req.method === "OPTIONS") return new Response(null, { headers: { ...cors, "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type" } });
  if (!OURS.test(origin)) return new Response("bad origin", { status: 403 });
  const f = await req.formData();
  const email = String(f.get("email") || "").trim().toLowerCase();
  const wantsJson = (req.headers.get("accept") || "").includes("json");
  const done = (ok) => wantsJson
    ? Response.json({ ok }, { status: ok ? 200 : 400, headers: cors })
    : Response.redirect(`${req.headers.get("referer") || origin}#${ok ? "signed-up" : "signup-failed"}`, 303);
  if (f.get("website")) return done(true); // honeypot: bots fill every field
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) return done(false);
  const r = await fetch(`https://api.resend.com/audiences/${LIST}/contacts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, unsubscribed: false }),
  });
  return done(r.ok);
}

export default {
  async fetch(req, env) {
    if (new URL(req.url).pathname === "/signup") return signup(req, env);
    if (req.method !== "POST") return new Response("authmail", { status: 200 });
    const ref = new URL(req.url).pathname.replace(/^\/+|\/+$/g, "");
    if (!/^[a-z]{20}$/.test(ref)) return new Response("bad project", { status: 404 });
    const body = await req.text();
    if (!(await verify(req, body, env.HOOK_SECRET))) return new Response("bad signature", { status: 401 });

    const { user, email_data: d } = JSON.parse(body);
    const type = d.email_action_type;
    const dest = d.redirect_to || d.site_url;
    const t = themeFor(dest);
    const link = `https://${ref}.supabase.co/auth/v1/verify?token=${encodeURIComponent(d.token_hash)}&type=${type}&redirect_to=${encodeURIComponent(dest)}`;

    const r = await send(env, t, type, user.email, link, d.token);
    if (!r.ok) return new Response(await r.text(), { status: 500 });

    // ponytail: welcome email rides the signup confirmation request, not a separate
    // post-confirmation trigger — no DB webhook needed, one extra Resend call here.
    if (type === "signup") await send(env, t, "welcome", user.email, dest);

    return new Response("{}", { headers: { "Content-Type": "application/json" } });
  },
};
