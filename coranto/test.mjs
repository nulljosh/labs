// The proxy used to return any https URL with `access-control-allow-origin: *`, which
// made it usable as an anonymizing proxy by any site. These pin the guards.
import { test } from "node:test";
import assert from "node:assert/strict";
import { onRequestGet } from "./functions/feed.js";

const call = (url) =>
  onRequestGet({ request: new Request(`https://coranto.jaybulb.com/feed?url=${encodeURIComponent(url)}`) });

test("rejects non-https", async () => {
  assert.equal((await call("http://example.com/rss")).status, 400);
});

test("rejects loopback and private hosts", async () => {
  for (const h of ["http://localhost/x", "https://127.0.0.1/x", "https://169.254.169.254/x", "https://10.1.2.3/x"]) {
    assert.equal((await call(h)).status, 400, h);
  }
});

test("rejects a malformed url", async () => {
  assert.equal((await call("not a url")).status, 400);
});

test("never returns a wildcard CORS origin", async () => {
  const bad = await call("http://example.com/rss");
  assert.equal(bad.headers.get("access-control-allow-origin"), "https://coranto.jaybulb.com");

  globalThis.fetch = async () => new Response("<rss/>", { headers: { "content-type": "application/xml" } });
  const ok = await call("https://example.com/rss");
  assert.equal(ok.headers.get("access-control-allow-origin"), "https://coranto.jaybulb.com");
});

test("refuses a feed larger than the cap", async () => {
  globalThis.fetch = async () =>
    new Response("x", { headers: { "content-length": String(50 * 1024 * 1024) } });
  assert.equal((await call("https://example.com/big")).status, 413);
});

// Headline cleaning, shared rules with the Swift app (web/headline.js sets globalThis.Headline).
await import("./web/headline.js");
const { clean, variants } = globalThis.Headline;

test("headline drops section tags, outlet names and asides", () => {
  assert.equal(clean("Opinion | Congress’s Russia Problems"), "Congress’s Russia Problems");
  assert.equal(clean("Storm hits coast - BBC News", "BBC"), "Storm hits coast");
  assert.equal(clean("Rates fall (again) [Video]"), "Rates fall");
});

test("headline variants cut at a clause first, never on a filler word", () => {
  const v = variants("Jaylen Brown ratchets up Jayson Tatum drama: ‘He should stay ready at all times’");
  assert.equal(v[1], "Jaylen Brown ratchets up Jayson Tatum drama");
  assert.ok(variants("Show HN: I put employees inside S&P 500 bubbles").some((x) => x.startsWith("Show HN:")));
  for (const x of v) assert.ok(!["to", "the", "of", "at"].includes(x.split(" ").pop()), x);
});
