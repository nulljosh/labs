// Signup flow tests: the Worker's fetch handler, a fake env and a fake Resend. No deps.
// Run: node --test
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

const BASE = "https://authmail.heyitsmejosh.com";
const ORIGIN = "https://roost.heyitsmejosh.com";
const realFetch = globalThis.fetch;
const realNow = Date.now;
let emails, contacts, requests, keys, deny, upserts, resendDown, env;

// A fake rate limiter: records every key and denies what `deny[name]` says to deny.
const limiter = (name) => ({ limit: async ({ key }) => { keys[name].push(key); return { success: !deny[name]?.(key) }; } });
// The real thing's shape: n requests per key, then refusals.
const counting = (name, n) => { const seen = new Map(); return { limit: async ({ key }) => { keys[name].push(key); seen.set(key, (seen.get(key) || 0) + 1); return { success: seen.get(key) <= n }; } }; };

beforeEach(() => {
  emails = []; contacts = new Map(); requests = []; deny = {}; upserts = false; resendDown = false;
  keys = { SIGNUP_RATE_LIMITER: [], RECIPIENT_RATE_LIMITER: [], GLOBAL_RATE_LIMITER: [] };
  env = {
    RESEND_API_KEY: "re_test", SIGNUP_SECRET: "test-secret",
    SIGNUP_RATE_LIMITER: limiter("SIGNUP_RATE_LIMITER"),
    RECIPIENT_RATE_LIMITER: limiter("RECIPIENT_RATE_LIMITER"),
    GLOBAL_RATE_LIMITER: limiter("GLOBAL_RATE_LIMITER"),
  };
  // Fake Resend: /emails records the mail; the contacts endpoint can be looked up (GET) and created (POST).
  // With `upserts` a duplicate POST overwrites the row and clears "unsubscribed", the worst case a real Resend might do.
  globalThis.fetch = async (url, init) => {
    if (resendDown) throw new TypeError("fetch failed");
    const u = String(url), body = init.body ? JSON.parse(init.body) : null;
    requests.push({ url: u, method: init.method, body });
    if (u.endsWith("/emails")) { emails.push(body); return Response.json({ id: "e1" }); }
    const one = /\/audiences\/[^/]+\/contacts\/([^/]+)$/.exec(u);
    if (one && init.method === "GET") {
      const c = contacts.get(decodeURIComponent(one[1]));
      return c ? Response.json(c) : Response.json({ name: "not_found" }, { status: 404 });
    }
    if (/\/audiences\/[^/]+\/contacts$/.test(u) && init.method === "POST") {
      if (contacts.has(body.email)) {
        if (!upserts) return Response.json({ message: "Contact already exists" }, { status: 409 });
        contacts.set(body.email, { ...contacts.get(body.email), ...body, unsubscribed: false });
        return Response.json({ id: "c1" });
      }
      contacts.set(body.email, { unsubscribed: false, ...body });
      return Response.json({ id: "c1" });
    }
    return new Response("nope", { status: 404 });
  };
  console.error = () => {};
});
afterEach(() => { globalThis.fetch = realFetch; Date.now = realNow; });

const form = (fields) => new URLSearchParams(fields);
const signup = (fields, headers = {}) =>
  worker.fetch(new Request(`${BASE}/signup`, { method: "POST", body: form(fields), headers: { Origin: ORIGIN, "Sec-Fetch-Mode": "cors", ...headers } }), env);
// open: what a mail scanner or a first click does. confirm: the button press that actually enrols.
const open = (token, method = "GET") => worker.fetch(new Request(`${BASE}/confirm?t=${token}`, { method }), env);
const confirm = (token, headers = {}) => worker.fetch(new Request(`${BASE}/confirm`, { method: "POST", body: form({ t: token }), headers }), env);
const linkFrom = (mail) => new URL(/https:\/\/\S+\/confirm\?\S+/.exec(mail.text)[0]);
const tokenFrom = (mail) => linkFrom(mail).searchParams.get("t");
const writes = () => requests.filter((r) => r.method === "POST" && r.url.includes("/contacts"));

test("spoofed Origin without a confirm click never creates a contact", async () => {
  const res = await signup({ email: "victim@example.com" });
  assert.equal(res.status, 200);
  assert.equal(emails.length, 1);
  assert.deepEqual(emails[0].to, ["victim@example.com"]);
  assert.equal(contacts.size, 0);
  const bad = await signup({ email: "victim@example.com" }, { Origin: "https://evil.example" });
  assert.equal(bad.status, 403);
  assert.equal(emails.length, 1);
  assert.equal(contacts.size, 0);
});

test("confirm with a bad, tampered or expired token is refused", async () => {
  await signup({ email: "a@example.com" });
  const good = tokenFrom(emails[0]);
  for (const t of ["", "garbage", "a.b", `${good.slice(0, -2)}xx`, `${good.split(".")[0]}.`]) {
    assert.equal((await confirm(t)).status, 400, `token ${t}`);
    assert.equal((await open(t)).status, 400, `token ${t}`);
  }
  const base = Date.now();
  Date.now = () => base + 49 * 3600 * 1000;
  assert.equal((await confirm(good)).status, 400);
  assert.equal(contacts.size, 0);
  Date.now = () => base + 47 * 3600 * 1000;
  assert.equal((await confirm(good)).status, 303);
});

test("a token has exactly one spelling: junk, spaces and sibling characters are refused", async () => {
  await signup({ email: "a@example.com" });
  const good = tokenFrom(emails[0]);
  const [p, s] = good.split(".");
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  // a 32-byte MAC ends in a char whose low two bits are padding, so its siblings decode to the same bytes
  const sibling = alphabet[alphabet.indexOf(s.at(-1)) ^ 1];
  for (const t of [`${good}.junk`, `${p}.${s.slice(0, 5)}%20${s.slice(5)}`, `${p}.${s.slice(0, -1)}${sibling}`, `${p}.${s}=`, `${p}..${s}`]) {
    assert.equal((await confirm(t)).status, 400, `token ${t}`);
  }
  assert.equal(contacts.size, 0);
  assert.equal((await confirm(good)).status, 303);
});

test("a good token creates the contact exactly once, and a replay is ok", async () => {
  await signup({ email: "A@Example.com " });
  const t = tokenFrom(emails[0]);
  assert.equal((await confirm(t)).status, 303);
  assert.equal((await confirm(t)).status, 303); // already on file
  assert.equal(contacts.size, 1);
  assert.equal(writes().length, 1);
  assert.ok(contacts.has("a@example.com"));
});

test("GET /confirm only shows a button: a scanner that fetches the link enrols nobody", async () => {
  await signup({ email: "ceo@bigcorp.example" });
  const t = tokenFrom(emails[0]);
  const ua = { "User-Agent": "Mimecast LinkScanner" };
  const get = await worker.fetch(new Request(`${BASE}/confirm?t=${t}`, { headers: ua }), env);
  assert.equal(get.status, 200);
  const html = await get.text();
  assert.match(html, /<form method="post" action="\/confirm"/);
  assert.ok(html.includes(`value="${t}"`));
  assert.equal(get.headers.get("referrer-policy"), "no-referrer");
  assert.equal(requests.filter((r) => r.url.includes("/contacts")).length, 0);
  assert.equal(contacts.size, 0);
  assert.equal((await open(t, "HEAD")).status, 405);
  assert.equal((await open(t, "PUT")).status, 405);
  assert.equal(contacts.size, 0);
  assert.equal((await confirm(t)).status, 303);
  assert.equal(contacts.size, 1);
});

test("confirm never sends an unsubscribed field and leaves an opted-out address alone, even if Resend upserts", async () => {
  for (const upsert of [false, true]) {
    contacts.set("out@example.com", { email: "out@example.com", unsubscribed: true });
    upserts = upsert; requests = []; emails = []; deny = {};
    env.RECIPIENT_RATE_LIMITER = limiter("RECIPIENT_RATE_LIMITER");
    await signup({ email: "out@example.com" });
    assert.equal((await confirm(tokenFrom(emails[0]))).status, 303);
    assert.equal(writes().length, 0, "an existing contact is never written to");
    assert.equal(contacts.get("out@example.com").unsubscribed, true, `upserts=${upsert}`);
  }
  await signup({ email: "new@example.com" });
  assert.equal((await confirm(tokenFrom(emails.at(-1)))).status, 303);
  assert.equal("unsubscribed" in writes()[0].body, false);
});

test("a JSON or empty body does not 500", async () => {
  const json = await worker.fetch(new Request(`${BASE}/signup`, { method: "POST", body: JSON.stringify({ email: "a@example.com" }), headers: { Origin: ORIGIN, "Content-Type": "application/json" } }), env);
  assert.equal(json.status, 400);
  assert.deepEqual(await json.json(), { ok: false });
  assert.equal(json.headers.get("access-control-allow-origin"), ORIGIN);
  assert.equal(json.headers.get("vary"), "Origin");
  const empty = await worker.fetch(new Request(`${BASE}/signup`, { method: "POST", headers: { Origin: ORIGIN } }), env);
  assert.equal(empty.status, 400);
  const badConfirm = await worker.fetch(new Request(`${BASE}/confirm`, { method: "POST", body: "{}", headers: { "Content-Type": "application/json" } }), env);
  assert.equal(badConfirm.status, 400);
  assert.equal(emails.length, 0);
});

test("GET /signup is refused, OPTIONS answers CORS", async () => {
  const get = await worker.fetch(new Request(`${BASE}/signup`, { headers: { Origin: ORIGIN } }), env);
  assert.equal(get.status, 405);
  assert.equal(emails.length + contacts.size, 0);
  const opt = await worker.fetch(new Request(`${BASE}/signup`, { method: "OPTIONS", headers: { Origin: ORIGIN } }), env);
  assert.equal(opt.headers.get("access-control-allow-origin"), ORIGIN);
});

test("rate-limit denial returns 429, and a missing or throwing binding refuses too", async () => {
  deny.SIGNUP_RATE_LIMITER = () => true;
  assert.equal((await signup({ email: "a@example.com" })).status, 429);
  deny = {};
  for (const name of ["SIGNUP_RATE_LIMITER", "RECIPIENT_RATE_LIMITER", "GLOBAL_RATE_LIMITER"]) {
    const saved = env[name];
    delete env[name];
    assert.equal((await signup({ email: "a@example.com" })).status, 429, `${name} missing`);
    env[name] = { limit: async () => { throw new Error("limiter down"); } };
    assert.equal((await signup({ email: "a@example.com" })).status, 429, `${name} throws`);
    env[name] = saved;
  }
  assert.equal(emails.length, 0);
});

test("one address gets one confirm mail a minute, however many IPs ask", async () => {
  env.RECIPIENT_RATE_LIMITER = counting("RECIPIENT_RATE_LIMITER", 1);
  for (let i = 0; i < 20; i++) {
    const res = await signup({ email: "victim@example.com" }, { "cf-connecting-ip": `2001:db8:1:${i}::1` });
    assert.equal(res.status, 200, "same answer every time");
  }
  assert.equal(emails.length, 1);
  await signup({ email: "other@example.com" });
  assert.equal(emails.length, 2);
});

test("rate limits key IPv6 on the /64, so sibling addresses share one bucket", async () => {
  await signup({ email: "a@example.com" }, { "cf-connecting-ip": "2001:0db8:0000:0007:aaaa:bbbb:cccc:dddd" });
  await signup({ email: "b@example.com" }, { "cf-connecting-ip": "2001:db8:0:7::1" });
  await signup({ email: "c@example.com" }, { "cf-connecting-ip": "203.0.113.9" });
  await signup({ email: "d@example.com" }, { "cf-connecting-ip": "::ffff:203.0.113.9" });
  assert.deepEqual(keys.SIGNUP_RATE_LIMITER, ["2001:db8:0:7::/64", "2001:db8:0:7::/64", "203.0.113.9", "203.0.113.9"]);
});

test("hammering confirm with one valid token is capped per IP, per address and overall", async () => {
  await signup({ email: "a@example.com" });
  const t = tokenFrom(emails[0]);
  env.SIGNUP_RATE_LIMITER = counting("SIGNUP_RATE_LIMITER", 5);
  env.RECIPIENT_RATE_LIMITER = counting("RECIPIENT_RATE_LIMITER", 1);
  const codes = [];
  for (let i = 0; i < 20; i++) codes.push((await confirm(t, { "cf-connecting-ip": "203.0.113.9" })).status);
  assert.equal(codes.filter((c) => c === 303).length, 1);
  assert.equal(codes.filter((c) => c === 429).length, 19);
  assert.equal(requests.filter((r) => r.url.includes("/contacts")).length, 2, "one lookup and one create, then nothing reaches Resend");
  deny.GLOBAL_RATE_LIMITER = () => true;
  env.RECIPIENT_RATE_LIMITER = limiter("RECIPIENT_RATE_LIMITER");
  assert.equal((await confirm(t, { "cf-connecting-ip": "203.0.113.77" })).status, 429);
  assert.equal((await signup({ email: "z@example.com" })).status, 429);
});

test("honeypot and bad emails send nothing", async () => {
  assert.equal((await signup({ email: "a@example.com", website: "http://spam" })).status, 200);
  assert.equal((await signup({ email: "not-an-email" })).status, 400);
  assert.equal(emails.length, 0);
});

test("navigations get a redirect, and the return URL is checked against the allow-list", async () => {
  const nav = { "Sec-Fetch-Mode": "navigate" };
  const ok = await signup({ email: "a@example.com", return: "https://roost.heyitsmejosh.com/pricing?x=1#frag" }, nav);
  assert.equal(ok.status, 303);
  assert.equal(ok.headers.get("location"), "https://roost.heyitsmejosh.com/pricing?x=1#signed-up");
  const evil = await signup({ email: "b@example.com", return: "https://evil.example/phish" }, nav);
  assert.equal(evil.headers.get("location"), `${ORIGIN}#signed-up`);
  const fail = await signup({ email: "nope" }, nav);
  assert.equal(fail.headers.get("location"), `${ORIGIN}#signup-failed`);
  // the return URL rides inside the signed token, and the confirm click lands there
  const done = await confirm(tokenFrom(emails[0]));
  assert.equal(done.status, 303);
  assert.equal(done.headers.get("location"), "https://roost.heyitsmejosh.com/pricing?x=1#subscribed");
  assert.equal(linkFrom(emails[0]).searchParams.has("r"), false, "the mailed link carries no editable return URL");
});

test("the confirm link cannot be pointed anywhere: an r parameter is ignored", async () => {
  await signup({ email: "a@example.com", return: "https://roost.heyitsmejosh.com/pricing" }, { "Sec-Fetch-Mode": "navigate" });
  await signup({ email: "b@example.com" });
  for (const r of ["https://evil.example/", "https://jaybulb.com/phish", "https://login.jaybulb.com/reset-password", "https://roost.heyitsmejosh.com/elsewhere"]) {
    const t = tokenFrom(emails[0]);
    const res = await worker.fetch(new Request(`${BASE}/confirm`, { method: "POST", body: form({ t, r }) }), env);
    assert.equal(res.headers.get("location"), "https://roost.heyitsmejosh.com/pricing#subscribed", `r=${r}`);
    const get = await worker.fetch(new Request(`${BASE}/confirm?t=${t}&r=${encodeURIComponent(r)}`), env);
    assert.equal(get.status, 200);
    assert.equal(get.headers.get("location"), null);
  }
  // a signup with no return URL lands on the page that posted, as a page when there is nowhere to go
  const home = await confirm(tokenFrom(emails[1]));
  assert.equal(home.headers.get("location"), `${ORIGIN}/#subscribed`);
});

test("jaybulb.com is not ours until someone owns it: no CORS, no redirect, no old tokens", async () => {
  const res = await signup({ email: "a@example.com" }, { Origin: "https://jaybulb.com" });
  assert.equal(res.status, 403);
  assert.equal(res.headers.get("access-control-allow-origin"), null);
  assert.equal((await signup({ email: "a@example.com" }, { Origin: "https://login.jaybulb.com" })).status, 403);
  for (const ret of ["https://login.jaybulb.com/reset-password", "https://jaybulb.com/phish"]) {
    const nav = await signup({ email: "b@example.com", return: ret }, { "Sec-Fetch-Mode": "navigate" });
    assert.equal(nav.headers.get("location"), `${ORIGIN}#signed-up`);
  }
  assert.equal(emails.length, 2);
  const done = await confirm(tokenFrom(emails[0]));
  assert.equal(done.headers.get("location"), `${ORIGIN}/#subscribed`);
  for (const o of ["https://evilheyitsmejosh.com", "https://heyitsmejosh.com.evil.example", "https://sub.nulljosh.github.io", "http://heyitsmejosh.com"]) {
    assert.equal((await signup({ email: "c@example.com" }, { Origin: o })).status, 403, o);
  }
  assert.equal((await signup({ email: "d@example.com" }, { Origin: "https://nulljosh.github.io" })).status, 200);
  assert.equal((await signup({ email: "e@example.com" }, { Origin: "https://heyitsmejosh.com" })).status, 200);
});

test("infra faults give a clean answer, never an uncaught exception", async () => {
  resendDown = true;
  const down = await signup({ email: "a@example.com" });
  assert.equal(down.status, 400);
  const nav = await signup({ email: "a@example.com" }, { "Sec-Fetch-Mode": "navigate" });
  assert.equal(nav.headers.get("location"), `${ORIGIN}#signup-failed`);
  resendDown = false;
  await signup({ email: "b@example.com" });
  const t = tokenFrom(emails[0]);
  resendDown = true;
  assert.equal((await confirm(t)).status, 502);
  resendDown = false;
  // an unexpected throw inside a handler is a 503, not an uncaught exception
  env.RECIPIENT_RATE_LIMITER = { limit: () => { throw new Error("sync boom"); } };
  assert.equal((await signup({ email: "c@example.com" })).status, 429);
  const bad = await worker.fetch(new Request(`${BASE}/signup`, { method: "POST", body: "x", headers: { Origin: ORIGIN, "Content-Type": "multipart/form-data; boundary=x" } }), env);
  assert.equal(bad.status, 400);
  env.RECIPIENT_RATE_LIMITER = limiter("RECIPIENT_RATE_LIMITER");
  assert.equal((await confirm(t)).status, 303, "the same link works once Resend is back");
});

test("missing SIGNUP_SECRET refuses signup and confirm", async () => {
  delete env.SIGNUP_SECRET;
  assert.equal((await signup({ email: "a@example.com" })).status, 400);
  assert.equal((await confirm("a.b")).status, 400);
  assert.equal((await open("a.b")).status, 400);
  assert.equal(emails.length + contacts.size, 0);
});
