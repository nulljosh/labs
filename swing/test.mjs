// One runnable check on the only real logic here: who gets paired with whom,
// that the clock ends a call nobody extended, and that handles are swapped
// only when both sides ask.
import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { Lobby } from "./worker.js";

const fake = (name) => ({ name, readyState: 1, sent: [], send(s) { this.sent.push(JSON.parse(s)); } });
const last = (ws) => ws.sent.at(-1);
const msg = (lobby, ws, o) => lobby.onMessage(ws, typeof o === "string" ? o : JSON.stringify(o));

// Hold the pair timers instead of waiting 15 real seconds for one.
const timers = [];
globalThis.setTimeout = (fn) => (timers.push(fn), timers.length);
globalThis.clearTimeout = () => {};

// The Durable Object's SQLite, stood in for by Node's own.
const room = () => {
  const db = new DatabaseSync(":memory:");
  const sql = { exec(q, ...p) {
    const st = db.prepare(q);
    if (!/^\s*select/i.test(q)) return void st.run(...p);
    const rows = st.all(...p);
    return { toArray: () => rows, one: () => rows[0] };
  } };
  return new Lobby({ blockConcurrencyWhile: (f) => f(), storage: { sql } });
};
const join = (lobby, ws, key) => lobby.who.set(ws, { handle: "", last: null, pair: null, key });

const lobby = room();
const [a, b, c] = ["a", "b", "c"].map(fake);
["a", "b", "c"].forEach((k, i) => join(lobby, [a, b, c][i], k));

msg(lobby, a, { type: "find", handle: " @ana  " });
assert.equal(last(a).type, "waiting");
assert.equal(lobby.who.get(a).handle, "@ana", "handle is trimmed");

msg(lobby, b, { type: "find", handle: "@bo" });
assert.deepEqual(last(a), { type: "matched", initiator: true, ms: 15000 });
assert.deepEqual(last(b), { type: "matched", initiator: false, ms: 15000 });

// Signals reach the partner and nobody else.
msg(lobby, a, { type: "signal", data: { sdp: "x" } });
assert.deepEqual(last(b), { type: "signal", data: { sdp: "x" } });

// Chat text reaches the partner, trimmed and capped, and empty text is dropped.
msg(lobby, a, { type: "chat", text: "  hi there " });
assert.deepEqual(last(b), { type: "chat", text: "hi there" });
msg(lobby, a, { type: "chat", text: "   " });
assert.deepEqual(last(b), { type: "chat", text: "hi there" }, "blank chat is not relayed");
assert.ok(msg(lobby, a, { type: "chat", text: "x".repeat(400) }) === undefined && last(b).text.length <= 280);

// One-sided votes only nudge the other side; they never take effect.
msg(lobby, a, { type: "extend" });
assert.deepEqual(last(b), { type: "asked", what: "extend" });
msg(lobby, a, { type: "keep" });
assert.deepEqual(last(b), { type: "asked", what: "keep" });
assert.ok(!a.sent.some((m) => m.type === "kept"), "no handle leaks on a one-sided keep");

// Both sides: time is added, and handles cross.
msg(lobby, b, { type: "extend" });
assert.deepEqual(last(a), { type: "extended", ms: 15000 });
msg(lobby, b, { type: "keep" });
assert.deepEqual(last(a), { type: "kept", handle: "@bo" });
assert.deepEqual(last(b), { type: "kept", handle: "@ana" });

// The clock ends a call nobody extended, and neither is rematched to the other.
msg(lobby, c, { type: "find", handle: "@cy" });
timers.at(-1)();
assert.equal(a.sent.at(-2).type, "time-up");
assert.equal(last(a).type, "matched", "a is rematched with the waiting c");
assert.equal(last(c).type, "matched");
assert.equal(last(b).type, "waiting", "b is not handed straight back to a");

// Leaving frees the partner, and junk on the wire is ignored, not thrown.
lobby.drop(a);
assert.deepEqual(last(c), { type: "peer-left", reason: "left" });
msg(lobby, c, "{not json");

// Blocking ends the call and keeps the pair apart for good, both ways round.
{
  const l = room();
  const [x, y, z] = ["x", "y", "z"].map(fake);
  ["x", "y", "z"].forEach((k, i) => join(l, [x, y, z][i], k));
  msg(l, x, { type: "find", handle: "kill yourself @x" });
  assert.equal(l.who.get(x).handle, "************* @x", "handles are masked");
  msg(l, y, { type: "find", handle: "@y" });
  msg(l, x, { type: "chat", text: "send nudes" });
  assert.deepEqual(last(y), { type: "chat", text: "**********" }, "chat is masked");
  msg(l, y, { type: "block" });
  assert.deepEqual(last(x), { type: "peer-left", reason: "blocked" });
  msg(l, y, { type: "find", handle: "@y" });
  msg(l, x, { type: "find", handle: "@x" });
  assert.equal(last(y).type, "waiting", "y never meets x again");
  assert.equal(last(x).type, "waiting", "and x never meets y");
  msg(l, z, { type: "find", handle: "@z" });
  assert.equal(last(z).type, "matched", "z can still match");
}

// A browser may deliver an ICE candidate before its offer. Keep it until the
// remote description is installed so that the connection can still form.
const source = await readFile(new URL("./web/chat.js", import.meta.url), "utf8");
const { Chat } = await import(`data:text/javascript,${encodeURIComponent(source)}`);
const added = [];
globalThis.RTCPeerConnection = class {
  addTrack() {}
  close() {}
  async setRemoteDescription(description) { this.remoteDescription = description; }
  async addIceCandidate(candidate) { added.push(candidate); }
  async createAnswer() { return { type: "answer" }; }
  async setLocalDescription(description) { this.localDescription = description; }
};
const chat = new Chat({ local: {}, remote: {} });
chat.stream = { getTracks: () => [] };
chat.ice = [];
await chat.openPeer(false);
await chat.onSignal({ candidate: { candidate: "early" } });
assert.equal(added.length, 0);
await chat.onSignal({ sdp: { type: "offer", sdp: "test" } });
assert.deepEqual(added, [{ candidate: "early" }]);

let startNote = "";
const blocked = new Chat({ local: {}, remote: {}, onState: (_, note) => { startNote = note; } });
Object.defineProperty(globalThis, "navigator", {
  configurable: true,
  value: { mediaDevices: { getUserMedia: async () => {
    const error = new Error("denied");
    error.name = "NotAllowedError";
    throw error;
  } } },
});
await blocked.start("");
assert.equal(blocked.state, "idle");
assert.match(startNote, /Allow camera and microphone access/);
console.log("ok");
