// Signup flow tests: the Worker's fetch handler, a fake env and a fake Resend. No deps.
// Run: node --test
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

const BASE = "https://authmail.heyitsmejosh.com";
const ORIGIN = "https://roost.heyitsmejosh.com";
const realFetch = globalThis.fetch;
const realNow = Date.now;
let emails, contacts, requests, limiterOk, env;

beforeEach(() => {
  emails = []; contacts = new Map(); requests = []; limiterOk = true;
  env = {
    RESEND_API_KEY: "re_test", SIGNUP_SECRET: "test-secret",
    SIGNUP_RATE_LIMITER: { limit: async () => ({ success: limiterOk }) },
  };
  // Fake Resend: /emails records the mail, the contacts endpoint knows duplicates and never touches an existing row.
  globalThis.fetch = async (url, init) => {
    const body = JSON.parse(init.body);
    requests.push({ url: String(url), body });
    if (String(url).endsWith("/emails")) { emails.push(body); return Response.json({ id: "e1" }); }
    if (/\/audiences\/[^/]+\/contacts$/.test(String(url))) {
      if (contacts.has(body.email)) return Response.json({ message: "Contact already exists" }, { status: 409 });
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
const confirm = (token, extra = "") => worker.fetch(new Request(`${BASE}/confirm?t=${token}${extra}`), env);
const linkFrom = (mail) => new URL(/https:\/\/\S+\/confirm\?\S+/.exec(mail.text)[0]);
const tokenFrom = (mail) => linkFrom(mail).searchParams.get("t");

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
  }
  const base = Date.now();
  Date.now = () => base + 49 * 3600 * 1000;
  assert.equal((await confirm(good)).status, 400);
  assert.equal(contacts.size, 0);
  Date.now = () => base + 47 * 3600 * 1000;
  assert.equal((await confirm(good)).status, 200);
});

test("a good token creates the contact exactly once, and a duplicate is ok", async () => {
  await signup({ email: "A@Example.com " });
  const t = tokenFrom(emails[0]);
  assert.equal((await confirm(t)).status, 200);
  assert.equal((await confirm(t)).status, 200); // Resend says "already exists"
  assert.equal(contacts.size, 1);
  assert.ok(contacts.has("a@example.com"));
});

test("confirm never sends an unsubscribed field and leaves an opted-out address alone", async () => {
  contacts.set("out@example.com", { email: "out@example.com", unsubscribed: true });
  await signup({ email: "out@example.com" });
  assert.equal((await confirm(tokenFrom(emails[0]))).status, 200);
  const writes = requests.filter((r) => r.url.includes("/contacts"));
  assert.equal(writes.length, 1);
  assert.equal("unsubscribed" in writes[0].body, false);
  assert.equal(contacts.get("out@example.com").unsubscribed, true);
});

test("a JSON or empty body does not 500", async () => {
  const json = await worker.fetch(new Request(`${BASE}/signup`, { method: "POST", body: JSON.stringify({ email: "a@example.com" }), headers: { Origin: ORIGIN, "Content-Type": "application/json" } }), env);
  assert.equal(json.status, 400);
  assert.deepEqual(await json.json(), { ok: false });
  assert.equal(json.headers.get("access-control-allow-origin"), ORIGIN);
  assert.equal(json.headers.get("vary"), "Origin");
  const empty = await worker.fetch(new Request(`${BASE}/signup`, { method: "POST", headers: { Origin: ORIGIN } }), env);
  assert.equal(empty.status, 400);
  assert.equal(emails.length, 0);
});

test("GET /signup is refused, OPTIONS answers CORS", async () => {
  const get = await worker.fetch(new Request(`${BASE}/signup`, { headers: { Origin: ORIGIN } }), env);
  assert.equal(get.status, 405);
  assert.equal(emails.length + contacts.size, 0);
  const opt = await worker.fetch(new Request(`${BASE}/signup`, { method: "OPTIONS", headers: { Origin: ORIGIN } }), env);
  assert.equal(opt.headers.get("access-control-allow-origin"), ORIGIN);
});

test("rate-limit denial returns 429, and a missing binding refuses too", async () => {
  limiterOk = false;
  assert.equal((await signup({ email: "a@example.com" })).status, 429);
  delete env.SIGNUP_RATE_LIMITER;
  assert.equal((await signup({ email: "a@example.com" })).status, 429);
  assert.equal(emails.length, 0);
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
  // confirm carries the return URL through the email link and lands there
  const done = await confirm(tokenFrom(emails[0]), `&r=${encodeURIComponent("https://roost.heyitsmejosh.com/pricing")}`);
  assert.equal(done.status, 303);
  assert.equal(done.headers.get("location"), "https://roost.heyitsmejosh.com/pricing#subscribed");
  const open = await confirm(tokenFrom(emails[1]), `&r=${encodeURIComponent("https://evil.example/")}`);
  assert.equal(open.status, 200);
});

test("missing SIGNUP_SECRET refuses signup and confirm", async () => {
  delete env.SIGNUP_SECRET;
  assert.equal((await signup({ email: "a@example.com" })).status, 400);
  assert.equal((await confirm("a.b")).status, 400);
  assert.equal(emails.length + contacts.size, 0);
});
