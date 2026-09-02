// Supabase "Send Email" auth hook → branded email per app via Resend.
// Both Supabase projects point here; the project ref is the URL path.
// ponytail: theme is a static map keyed on the redirect URL. Add a row per app, nothing else.

const THEMES = {
  lexly:     { name: "Lexly",           accent: "#5B9BD5", match: ["lexly", "lingo"] },
  healstack: { name: "Healstack",       accent: "#5B9BD5", match: ["healstack", "dose"] },
  litigate:  { name: "Litigate",        accent: "#1F3A5F", match: ["litigate"] },
  homeward:  { name: "Homeward",        accent: "#FF851B", match: ["homeward", "pets"] },
  bookrank:  { name: "Bookrank",        accent: "#5B9BD5", match: ["bookrank"] },
  bcgd:      { name: "BC Garage Doors", accent: "#B4661C", match: ["bcgd", "doorstock"] },
  roost:     { name: "Roost",           accent: "#2E7D32", match: ["roost"] },
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
};
const BODY = {
  signup: "Tap the button to confirm your email and activate your account.",
  recovery: "Tap the button to choose a new password. If you did not ask for this, ignore this email.",
  magiclink: "Tap the button to sign in.",
  invite: "You have been invited. Tap the button to accept and create your account.",
  email_change: "Tap the button to confirm your new email address.",
  reauthentication: "Enter this code to continue:",
};

function themeFor(redirectTo = "") {
  const r = redirectTo.toLowerCase();
  for (const t of Object.values(THEMES)) if (t.match.some((m) => r.includes(m))) return t;
  return DEFAULT;
}

function html(t, type, link, token) {
  const cta = type === "reauthentication"
    ? `<p style="font-size:28px;letter-spacing:6px;font-weight:600;margin:24px 0">${token}</p>`
    : `<a href="${link}" style="display:inline-block;background:${t.accent};color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;margin:24px 0">${SUBJECT[type] || "Continue"}</a>`;
  return `<!doctype html><body style="margin:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif;color:#111">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border-radius:12px;padding:32px;text-align:left">
<tr><td style="font-size:14px;font-weight:600;color:${t.accent};padding-bottom:20px">${t.name}</td></tr>
<tr><td style="font-size:22px;font-weight:600;padding-bottom:12px">${SUBJECT[type] || "Continue"}</td></tr>
<tr><td style="font-size:15px;line-height:1.5;color:#444">${BODY[type] || ""}</td></tr>
<tr><td>${cta}</td></tr>
<tr><td style="font-size:12px;color:#888;line-height:1.5">This link expires in one hour. If the button does not work, copy this into your browser:<br><span style="word-break:break-all">${type === "reauthentication" ? "" : link}</span></td></tr>
</table></td></tr></table></body>`;
}

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

export default {
  async fetch(req, env) {
    if (req.method !== "POST") return new Response("authmail", { status: 200 });
    const ref = new URL(req.url).pathname.replace(/^\/+|\/+$/g, "");
    if (!/^[a-z]{20}$/.test(ref)) return new Response("bad project", { status: 404 });
    const body = await req.text();
    if (!(await verify(req, body, env.HOOK_SECRET))) return new Response("bad signature", { status: 401 });

    const { user, email_data: d } = JSON.parse(body);
    const type = d.email_action_type;
    const t = themeFor(d.redirect_to || d.site_url);
    const link = `https://${ref}.supabase.co/auth/v1/verify?token=${encodeURIComponent(d.token_hash)}&type=${type}&redirect_to=${encodeURIComponent(d.redirect_to || d.site_url)}`;

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `${t.name} <noreply@heyitsmejosh.com>`,
        to: [user.email],
        subject: `${SUBJECT[type] || "Continue"} · ${t.name}`,
        html: html(t, type, link, d.token),
      }),
    });
    if (!r.ok) return new Response(await r.text(), { status: 500 });
    return new Response("{}", { headers: { "Content-Type": "application/json" } });
  },
};
