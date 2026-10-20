// Client half of the loop: hold the camera, talk to the lobby socket, rebuild
// one RTCPeerConnection per stranger, and mirror the server's call clock.

// Practice: an empty lobby is a dead screen, so after a few seconds alone you get a call
// with Iri, the mascot, clearly labelled as not a person. You stay queued the whole time and
// a real match replaces it instantly. Nothing practice does reaches the server.
const PRACTICE_AFTER_MS = 6000;
const IRI = [
  "ooh, tell me more",
  "I only speak monkey, but I like you",
  "real strangers are way more fun than me",
  "ha!",
  "hang tight, a real person usually turns up soon",
];

const FALLBACK_ICE = [{ urls: ["stun:stun.cloudflare.com:3478", "stun:stun.l.google.com:19302"] }];

// The server mints short-lived TURN credentials per visit. Fetched once when the
// camera starts, not per stranger, and a failure just means STUN-only.
async function iceServers() {
  try {
    const res = await fetch("/ice");
    const data = await res.json();
    return data.iceServers?.length ? data.iceServers : FALLBACK_ICE;
  } catch {
    return FALLBACK_ICE;
  }
}

export class Chat {
  constructor({ local, remote, onState, onClock, onAsked, onKept, onChat }) {
    this.timers = [];
    this.localEl = local;
    this.remoteEl = remote;
    this.onState = onState || (() => {});
    this.onClock = onClock || (() => {});
    this.onAsked = onAsked || (() => {});
    this.onKept = onKept || (() => {});
    this.onChat = onChat || (() => {});
    this.handle = "";
    this.stream = null;
    this.ws = null;
    this.pc = null;
    this.tick = null;
    this.set("idle");
  }

  set(state, note) {
    this.state = state;
    this.onState(state, note);
  }

  async start(handle) {
    if (this.state !== "idle") return;
    this.handle = handle || "";
    this.ice = FALLBACK_ICE;
    this.set("idle", "Requesting camera...");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera access needs HTTPS and a supported browser.");
      }
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (error) {
      const note = error.name === "NotAllowedError"
        ? "Allow camera and microphone access in your browser, then tap Start again."
        : error.name === "NotFoundError"
          ? "No camera or microphone was found. Connect both, then tap Start again."
          : error.name === "NotReadableError"
            ? "Your camera or microphone is in use by another app. Close it, then tap Start again."
            : error.message || "Camera could not start. Check browser permissions and try again.";
      this.set("idle", note);
      return;
    }
    this.localEl.srcObject = this.stream;
    this.ice = await iceServers();
    this.connect();
  }

  connect() {
    const url = new URL("/ws", location.href);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    this.ws = new WebSocket(url);
    this.ws.onopen = () => this.find();
    this.ws.onmessage = (e) => this.onServer(JSON.parse(e.data));
    this.ws.onclose = () => {
      if (this.state !== "idle") this.stop("Connection lost. Check your network, then tap Start again.");
    };
    this.set("searching", "Looking for someone...");
  }

  find() {
    this.send({ type: "find", handle: this.handle });
  }

  send(obj) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(obj));
  }

  async onServer(msg) {
    switch (msg.type) {
      case "waiting":
        this.set("searching", "Looking for someone...");
        this.armPractice();
        break;
      case "matched":
        this.endPractice();
        await this.openPeer(msg.initiator);
        this.runClock(msg.ms);
        break;
      case "signal":
        await this.onSignal(msg.data);
        break;
      case "asked":
        this.onAsked(msg.what);
        break;
      case "extended":
        this.runClock(msg.ms);
        this.onAsked(null);
        break;
      case "kept":
        this.onKept(msg.handle);
        break;
      case "chat":
        this.onChat(msg.text);
        break;
      case "time-up":
        this.reset("Time ran out. Looking for someone...");
        break;
      case "peer-left":
        this.reset("Stranger left. Looking for someone...");
        this.find();
        break;
    }
  }

  // Display only — the server owns the real deadline and ends the call itself.
  runClock(ms, onEnd) {
    clearInterval(this.tick);
    const end = Date.now() + ms;
    const paint = () => {
      const left = Math.max(0, Math.round((end - Date.now()) / 1000));
      this.onClock(left);
      if (left === 0) { clearInterval(this.tick); onEnd?.(); }
    };
    paint();
    this.tick = setInterval(paint, 250);
  }

  async openPeer(initiator) {
    this.closePeer();
    const pc = new RTCPeerConnection({ iceServers: this.ice });
    this.pc = pc;
    this.pendingCandidates = [];
    for (const track of this.stream.getTracks()) pc.addTrack(track, this.stream);
    pc.ontrack = (e) => {
      this.remoteEl.srcObject = e.streams[0];
      this.set("connected", "Connected");
    };
    pc.onicecandidate = (e) => {
      if (e.candidate) this.send({ type: "signal", data: { candidate: e.candidate } });
    };
    this.set("connecting", "Connecting...");
    if (initiator) {
      await pc.setLocalDescription(await pc.createOffer());
      this.send({ type: "signal", data: { sdp: pc.localDescription } });
    }
  }

  async onSignal(data) {
    const pc = this.pc;
    if (!pc) return;
    if (data.sdp) {
      await pc.setRemoteDescription(data.sdp);
      if (pc !== this.pc) return;
      for (const candidate of this.pendingCandidates.splice(0)) {
        await pc.addIceCandidate(candidate);
      }
      if (data.sdp.type === "offer") {
        await pc.setLocalDescription(await pc.createAnswer());
        this.send({ type: "signal", data: { sdp: pc.localDescription } });
      }
    } else if (data.candidate) {
      // The first candidate can arrive before the offer or answer.
      if (pc.remoteDescription) await pc.addIceCandidate(data.candidate);
      else this.pendingCandidates.push(data.candidate);
    }
  }

  closePeer() {
    this.pendingCandidates = [];
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    this.remoteEl.srcObject = null;
  }

  reset(note) {
    clearInterval(this.tick);
    this.closePeer();
    this.onClock(null);
    this.onAsked(null);
    this.set("searching", note);
  }

  armPractice() {
    clearTimeout(this.wait);
    this.wait = setTimeout(() => { if (this.state === "searching") this.practice(); }, PRACTICE_AFTER_MS);
  }

  practice() {
    this.endPractice();
    this.onChat(null);
    this.onAsked(null);
    this.set("practice", "Practice call with Iri while you wait");
    this.later(() => this.iri("hi! I'm Iri, the Irisa mascot. Not a real person."), 1500);
    this.later(() => this.iri("tap More time to keep talking, or Keep to swap handles"), 6000);
    this.practiceClock();
  }

  practiceClock() {
    this.runClock(15000, () => {
      this.set("practice", "Time ran out. A real call moves on to someone new.");
      this.later(() => this.practice(), 2000);
    });
  }

  later(fn, ms) { this.timers.push(setTimeout(fn, ms)); }
  iri(text) { if (this.state === "practice") this.onChat(text); }

  endPractice() {
    clearTimeout(this.wait);
    this.timers.splice(0).forEach(clearTimeout);
    if (this.state === "practice") { clearInterval(this.tick); this.onClock(null); }
  }

  say(text) {
    if (!text) return;
    if (this.state === "practice") this.later(() => this.iri(IRI[Math.floor(Math.random() * IRI.length)]), 1000);
    else if (this.state === "connected") this.send({ type: "chat", text });
  }

  extend() {
    if (this.state !== "practice") return this.send({ type: "extend" });
    this.later(() => { this.iri("I tapped More time too."); this.practiceClock(); }, 1000);
  }

  keep() {
    if (this.state !== "practice") return this.send({ type: "keep" });
    this.later(() => this.onKept("@irisa"), 1000);
  }

  next() {
    if (this.state === "practice") return this.practice();
    this.reset("Looking for someone...");
    this.send({ type: "next" });
  }

  report(reason) {
    this.send({ type: "report", reason });
    this.reset("Reported. Looking for someone...");
    this.find();
  }

  block() {
    this.send({ type: "block" });
    this.reset("Blocked. Looking for someone...");
    this.find();
  }

  stop(note) {
    this.endPractice();
    clearInterval(this.tick);
    this.closePeer();
    this.onClock(null);
    if (this.ws) { this.ws.onclose = null; this.ws.close(); this.ws = null; }
    if (this.stream) {
      for (const t of this.stream.getTracks()) t.stop();
      this.stream = null;
    }
    this.localEl.srcObject = null;
    this.set("idle", note || "Idle");
  }
}
