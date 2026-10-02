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
  subscribe: "Confirm your subscription",
};
const BODY = {
  signup: "Tap the button to confirm your email and activate your account.",
  recovery: "Tap the button to choose a new password. If you did not ask for this, ignore this email.",
  magiclink: "Tap the button to sign in.",
  invite: "You have been invited. Tap the button to accept and create your account.",
  email_change: "Tap the button to confirm your new email address.",
  reauthentication: "Enter this code to continue:",
  welcome: "Your account is confirmed. Glad to have you.",
  subscribe: "Tap the button to get news about new apps and updates. If you did not sign up, ignore this email and nothing happens.",
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

const life = (type) => type === "subscribe" ? "This link expires in 48 hours." : "This link works once and expires in one hour.";

function html(t, type, link, token) {
  const title = SUBJECT[type] || "Continue";
  const ctaLabel = type === "welcome" ? `Open ${t.name}` : title;
  const cta = type === "reauthentication"
    ? `<p style="font-size:30px;letter-spacing:8px;font-weight:600;margin:28px 0">${token}</p>`
    : `<p style="margin:28px 0"><a href="${link}" style="display:inline-block;background:${t.accent};color:${ink(t.accent)};text-decoration:none;font-weight:600;font-size:16px;padding:13px 26px;border-radius:999px">${ctaLabel}</a></p>`;
  const fallback = type === "reauthentication" || type === "welcome" ? "" :
    `<p class="mute" style="font-size:13px;line-height:1.55;color:#6F675C;margin:0 0 24px">${life(type)}</p>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>${title} · ${t.name}</title>
<style>@media (prefers-color-scheme:dark){body,.bg{background:#14120F!important}.sheet{background:#1D1A16!important;border-color:#2E2A24!important}.rule{border-color:#2E2A24!important}.ink{color:#F4EEE3!important}.mute{color:#A59C8C!important}}</style></head>
<body class="bg" style="margin:0;background:#F4EEE3;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',Helvetica,Arial,sans-serif;color:#1A1814;-webkit-font-smoothing:antialiased">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="sheet" style="max-width:520px;background:#FBF8F1;border:1px solid #E2D9C6;border-radius:14px"><tr><td style="padding:36px 32px">
<p class="ink" style="font-size:15px;font-weight:600;letter-spacing:.01em;margin:0 0 28px;color:#1A1814">${t.icon ? `<img src="${t.icon}" width="28" height="28" alt="" style="vertical-align:middle;border-radius:7px;margin-right:10px;border:0">` : ""}<span style="vertical-align:middle">${t.name}</span></p>
<h1 class="ink" style="font-size:28px;line-height:1.15;font-weight:600;letter-spacing:-.02em;margin:0 0 14px;color:#1A1814">${title}</h1>
<p class="ink" style="font-size:16px;line-height:1.55;margin:0;color:#1A1814">${BODY[type] || ""}</p>
${cta}${fallback}
<p class="mute rule" style="font-size:13px;line-height:1.55;color:#6F675C;margin:0;border-top:1px solid #E2D9C6;padding-top:18px">Sent by ${t.name}.</p>
</td></tr></table></td></tr></table></body></html>`;
}

function text(t, type, link, token) {
  const body = BODY[type] || "";
  const action = type === "reauthentication" ? token : type === "welcome" ? "" : link;
  return `${t.name}\n\n${SUBJECT[type] || "Continue"}\n\n${body}${action ? `\n\n${action}` : ""}${action && type !== "reauthentication" ? `\n\n${life(type)}` : ""}\n\nSent by ${t.name}.\n`;
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

// One Resend call site: key, headers and the failure log live here. Callers read the Response. A body means
// POST, none means GET. A network fault becomes a 502 Response, so nothing downstream throws.
async function resend(env, path, body) {
  let r;
  try {
    r = await fetch(`https://api.resend.com${path}`, {
      method: body ? "POST" : "GET",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, ...(body && { "Content-Type": "application/json" }) },
      body: body && JSON.stringify(body),
    });
  } catch (e) {
    console.error("resend", path, "unreachable", String(e));
    return new Response("resend unreachable", { status: 502 });
  }
  if (!r.ok && r.status !== 404) console.error("resend", path, r.status, await r.clone().text());
  return r;
}

function send(env, t, type, to, link, token) {
  return resend(env, "/emails", {
    from: `${t.name} <noreply@heyitsmejosh.com>`,
    to: [to],
    subject: `${SUBJECT[type] || "Continue"} · ${t.name}`,
    html: html(t, type, link, token),
    text: text(t, type, link, token),
  });
}

// Landing-page email capture, double opt-in (CASL). POST /signup only emails a confirm link. GET /confirm
// only shows a button, and the Resend contact is created by the POST behind that button, so a link scanner
// that merely fetches the URL enrols nobody. Token = base64url(JSON {e: email, t: unixSeconds, r: return URL})
// + "." + base64url(HMAC-SHA256(SIGNUP_SECRET)), 48 h. The return URL lives inside the signed token, so the
// mailed link cannot be pointed anywhere else. The Origin check is only CORS hygiene (spoofable); consent,
// the honeypot and the rate limits are the gates.
// ponytail: one list. Joshua Tree's hardware waitlist lives in its own Worker's KV.
const LIST = "154529c4-2064-4a20-876e-7a8269371987"; // Resend "General": new apps and updates
// Only domains Joshua owns. jaybulb.com stays out until it is registered: an unowned name in this list is an open redirect.
const OURS = /^https:\/\/(([a-z0-9-]+\.)*heyitsmejosh\.com|nulljosh\.github\.io)$/;
const TOKEN_TTL = 48 * 3600;

const b64u = (u8) => btoa(String.fromCharCode(...u8)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64u = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
// Canonical base64url only: no padding, no spaces, no spare trailing bits, so one token has one spelling.
const canonical = (s) => /^[A-Za-z0-9_-]+$/.test(s) && b64u(unb64u(s)) === s;
const hmacKey = (env, use) => crypto.subtle.importKey("raw", new TextEncoder().encode(env.SIGNUP_SECRET), { name: "HMAC", hash: "SHA-256" }, false, [use]);

async function mint(env, email, back) {
  const p = b64u(new TextEncoder().encode(JSON.stringify({ e: email, t: Math.floor(Date.now() / 1000), r: back })));
  const mac = await crypto.subtle.sign("HMAC", await hmacKey(env, "sign"), new TextEncoder().encode(p));
  return `${p}.${b64u(new Uint8Array(mac))}`;
}

// {email, to} if the token is genuine, fresh and exactly as minted, else null. `to` is re-checked against the
// allow-list now, so dropping a domain from OURS kills old links to it. crypto.subtle.verify is constant time.
async function redeem(env, token = "") {
  try {
    const parts = token.split(".");
    if (token.length > 2048 || parts.length !== 2 || !parts.every(canonical)) return null;
    const [p, s] = parts;
    if (!(await crypto.subtle.verify("HMAC", await hmacKey(env, "verify"), unb64u(s), new TextEncoder().encode(p)))) return null;
    const { e, t, r } = JSON.parse(new TextDecoder().decode(unb64u(p)));
    const age = Date.now() / 1000 - t;
    if (typeof e !== "string" || typeof t !== "number" || !(age <= TOKEN_TTL && age >= -60)) return null;
    return { email: e, to: ourUrl(String(r || ""), "") };
  } catch {
    return null;
  }
}

// A return URL is honoured only on our own sites; anything else falls back.
function ourUrl(s, fallback) {
  try {
    const u = new URL(s);
    if (s.length <= 512 && OURS.test(u.origin)) return u.origin + u.pathname + u.search;
  } catch {}
  return fallback;
}

// true: allowed. false: over the limit. null: the binding is missing or threw, which callers treat as a refusal.
async function allow(env, name, key) {
  try {
    return (await env[name]?.limit({ key }))?.success === true ? true : env[name] ? false : null;
  } catch (e) {
    console.error("limiter", name, String(e));
    return null;
  }
}

// Rate-limit key for a client. One IPv6 customer owns a whole /64, so key on that, not on the single address.
function ipKey(req) {
  const ip = (req.headers.get("cf-connecting-ip") || "unknown").toLowerCase();
  const v4 = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(ip);
  if (v4) return v4[1];
  if (!ip.includes(":")) return ip;
  const [head, tail] = ip.split("::");
  const h = head ? head.split(":") : [], t = tail ? tail.split(":") : [];
  const groups = ip.includes("::") ? [...h, ...Array(Math.max(0, 8 - h.length - t.length)).fill("0"), ...t] : h;
  return `${groups.slice(0, 4).map((g) => parseInt(g || "0", 16).toString(16)).join(":")}::/64`;
}

async function signup(req, env, url) {
  const origin = req.headers.get("origin") || "";
  const ours = OURS.test(origin);
  const cors = { Vary: "Origin", ...(ours && { "Access-Control-Allow-Origin": origin }) };
  if (req.method === "OPTIONS") return new Response(null, { headers: { ...cors, "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type" } });
  if (!ours) return new Response("bad origin", { status: 403, headers: cors });
  // Browser navigations (the no-JS form) get a redirect back; everything else, fetch included, gets JSON.
  const nav = req.headers.get("sec-fetch-mode") === "navigate" || req.headers.get("sec-fetch-dest") === "document";
  let back = origin;
  const done = (ok) => nav
    ? new Response(null, { status: 303, headers: { ...cors, Location: `${back}#${ok ? "signed-up" : "signup-failed"}` } })
    : Response.json({ ok }, { status: ok ? 200 : 400, headers: cors });
  const slow = () => new Response("slow down", { status: 429, headers: cors });
  if (!(await allow(env, "SIGNUP_RATE_LIMITER", ipKey(req)))) return slow(); // also refuses when the binding is missing
  let f;
  try { f = await req.formData(); } catch { return done(false); } // JSON or empty body
  back = ourUrl(String(f.get("return") || ""), origin);
  if (f.get("website")) return done(true); // honeypot: bots fill every field
  const email = String(f.get("email") || "").trim().toLowerCase();
  if (!env.SIGNUP_SECRET || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) return done(false);
  // One confirm mail per address per minute, however many IPs ask, so nobody can bury a victim. The answer
  // is the same either way: the first mail is already on its way, and nobody learns which case they hit.
  const fresh = await allow(env, "RECIPIENT_RATE_LIMITER", `signup:${email}`);
  if (fresh === null) return slow();
  if (!fresh) return done(true);
  // Everything public shares Resend's 10 requests a second with the auth hook, so the whole public surface has a ceiling.
  if (!(await allow(env, "GLOBAL_RATE_LIMITER", "public"))) return slow();
  const link = `${url.origin}/confirm?t=${await mint(env, email, back)}`;
  return done((await send(env, DEFAULT, "subscribe", email, link)).ok);
}

const shell = (title, inner, status = 200) => new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><body style="margin:0;display:grid;place-items:center;min-height:100vh;background:#F4EEE3;color:#1A1814;font:600 20px -apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif">${inner}`, {
  status,
  headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'" },
});
const page = (msg, status) => shell(msg, `<p>${msg}</p>`, status);
// The button a human presses. `t` already passed redeem, so it is plain base64url and safe in an attribute.
const ask = (t) => shell("Confirm your subscription", `<form method="post" action="/confirm" style="text-align:center"><p>Confirm your subscription</p><input type="hidden" name="t" value="${t}"><button style="font:inherit;font-size:16px;background:#1A1814;color:#FFFFFF;border:0;border-radius:999px;padding:13px 26px;cursor:pointer">Confirm</button></form>`);

// GET only shows the button and changes nothing. The POST behind it is the only place a contact is created.
// It looks the address up first and never writes over an existing one, so an opted-out address stays opted out
// whatever Resend does with a duplicate. Needs a Full-access Resend key (sending-only keys get 401 here).
// Known gap: a contact deleted from Resend inside the 48 h window can be re-added by its old link. Closing that
// needs a durable used-token store, which this Worker does not have.
async function confirm(req, env, url) {
  let t = "";
  if (req.method === "POST") { try { t = String((await req.formData()).get("t") || ""); } catch {} } else t = url.searchParams.get("t") || "";
  const tok = await redeem(env, t);
  if (!tok) return page("This link has expired. Sign up again.", 400);
  if (req.method === "GET") return ask(t);
  // Each check runs only if the one before passed, so a refused request spends no one else's allowance.
  const ok = (await allow(env, "SIGNUP_RATE_LIMITER", `confirm:${ipKey(req)}`)) && (await allow(env, "RECIPIENT_RATE_LIMITER", `confirm:${tok.email}`)) && (await allow(env, "GLOBAL_RATE_LIMITER", "public"));
  if (!ok) return page("Slow down. Try again in a minute.", 429);
  const seen = await resend(env, `/audiences/${LIST}/contacts/${encodeURIComponent(tok.email)}`);
  if (!seen.ok) {
    if (seen.status !== 404) return page("Something went wrong. Try again later.", 502);
    const r = await resend(env, `/audiences/${LIST}/contacts`, { email: tok.email });
    if (!r.ok && !/already exist/i.test(await r.clone().text())) return page("Something went wrong. Try again later.", 502);
  }
  return tok.to ? new Response(null, { status: 303, headers: { Location: `${tok.to}#subscribed` } }) : page("You are on the list.", 200);
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url), path = url.pathname;
    if (path === "/signup" || path === "/confirm") {
      const m = req.method;
      const run = path === "/signup" ? (m === "POST" || m === "OPTIONS") && signup : (m === "GET" || m === "POST") && confirm;
      if (!run) return new Response("method not allowed", { status: 405 });
      try { return await run(req, env, url); } catch (e) { console.error("authmail", String(e)); return new Response("try again later", { status: 503 }); }
    }
    if (req.method !== "POST") return new Response("authmail", { status: 200 });
    const ref = path.replace(/^\/+|\/+$/g, "");
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
    // post-confirmation trigger, so no DB webhook is needed, one extra Resend call here.
    if (type === "signup") await send(env, t, "welcome", user.email, dest);

    return new Response("{}", { headers: { "Content-Type": "application/json" } });
  },
};
