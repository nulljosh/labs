// quotestreak-duel: /duel/ws?room=ABCD opens a WebSocket into that room's Durable Object.
// The room holds two players at most and relays every message to the other one; the game
// itself (which ten quotes, scoring) runs in the page. Hibernation keeps idle rooms free.
// v19: /duel/ws?room=ABCD&watch=1 joins as a spectator. Spectators never send; after every
// player message they get the whole room as one {type: "state"} snapshot.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const room = (url.searchParams.get("room") || "").toUpperCase();
    const party = url.pathname === "/duel/party";
    if ((url.pathname !== "/duel/ws" && !party) || !/^[A-Z]{4}$/.test(room)) return new Response("not found", { status: 404 });
    if (request.headers.get("Upgrade") !== "websocket") return new Response("expected a websocket", { status: 426 });
    const ns = party ? env.PARTIES : env.ROOMS;
    return ns.get(ns.idFromName(room)).fetch(request);
  },
};

export class Room {
  constructor(state) { this.state = state; }

  async fetch(request) {
    const watch = new URL(request.url).searchParams.has("watch");
    const players = this.state.getWebSockets("player");
    if (!watch && players.length >= 2) return new Response("room full", { status: 409 });
    if (watch && this.state.getWebSockets("watch").length >= 100) return new Response("too many watching", { status: 409 });
    const [client, server] = Object.values(new WebSocketPair());
    this.state.acceptWebSocket(server, [watch ? "watch" : "player"]);
    if (watch) server.send(await this.snapshot());
    else {
      server.serializeAttachment({ host: players.length === 0, score: 0, i: 0, done: false, name: "" });
      server.send(JSON.stringify({ type: "joined", host: players.length === 0 }));
      for (const p of players) p.send(JSON.stringify({ type: "opponent" }));
      await this.tellWatchers();
    }
    return new Response(null, { status: 101, webSocket: client });
  }

  async snapshot(gone) {
    const players = this.state.getWebSockets("player").filter(p => p !== gone).map(p => p.deserializeAttachment()).sort((a, b) => b.host - a.host);
    return JSON.stringify({ type: "state", qids: (await this.state.storage.get("qids")) || null, players });
  }

  async tellWatchers(gone) {
    const watchers = this.state.getWebSockets("watch");
    if (!watchers.length) return;
    const s = await this.snapshot(gone);
    for (const w of watchers) w.send(s);
  }

  async webSocketMessage(ws, msg) {
    if (typeof msg !== "string" || msg.length > 2000 || this.state.getTags(ws).includes("watch")) return;
    let m;
    try { m = JSON.parse(msg); } catch { return; }
    if (m.type === "start" && Array.isArray(m.qids)) await this.state.storage.put("qids", m.qids.slice(0, 10).map(String));
    if (m.type === "answer" || m.type === "done") {
      const a = ws.deserializeAttachment();
      ws.serializeAttachment({ ...a, score: +m.score || 0, i: +m.i || a.i, done: a.done || m.type === "done", name: String(m.name || a.name).slice(0, 40) });
    }
    for (const p of this.state.getWebSockets("player")) if (p !== ws) p.send(msg);
    await this.tellWatchers();
  }

  async webSocketClose(ws) {
    if (this.state.getTags(ws).includes("watch")) return;
    const left = this.state.getWebSockets("player").filter(p => p !== ws);
    for (const p of left) p.send(JSON.stringify({ type: "left" }));
    await this.tellWatchers(ws);
    if (!left.length) await this.state.storage.deleteAll();  // the code can be reused for a new duel
  }
}

// v34: a party room. One host (the Apple TV, later any big screen) and up to eight players on their
// phones. The host runs the game and scores it; the room only routes: players' buzzes go to the host,
// the host's questions and reveals go to every player. Hibernation keeps idle parties free.
//   /duel/party?room=ABCD&role=host            the big screen
//   /duel/party?room=ABCD&name=Sam             a phone
export class Party {
  constructor(state) { this.state = state; }

  async fetch(request) {
    const q = new URL(request.url).searchParams;
    const host = q.get("role") === "host";
    if (host && this.state.getWebSockets("host").length) return new Response("this room already has a screen", { status: 409 });
    if (!host && this.state.getWebSockets("player").length >= 8) return new Response("room full", { status: 409 });
    const [client, server] = Object.values(new WebSocketPair());
    this.state.acceptWebSocket(server, [host ? "host" : "player"]);
    if (host) server.send(JSON.stringify({ type: "players", players: this.players() }));
    else {
      const id = crypto.randomUUID().slice(0, 8), name = (q.get("name") || "Player").trim().slice(0, 20) || "Player";
      server.serializeAttachment({ id, name });
      server.send(JSON.stringify({ type: "hello", id, screen: this.state.getWebSockets("host").length > 0 }));
      this.toHost({ type: "join", id, name });
    }
    return new Response(null, { status: 101, webSocket: client });
  }

  players() { return this.state.getWebSockets("player").map(p => p.deserializeAttachment()); }
  toHost(m) { for (const h of this.state.getWebSockets("host")) h.send(JSON.stringify(m)); }

  webSocketMessage(ws, msg) {
    if (typeof msg !== "string" || msg.length > 8000) return;
    let m;
    try { m = JSON.parse(msg); } catch { return; }
    if (this.state.getTags(ws).includes("host")) {
      // The host talks to everyone, or to one player with `to`.
      for (const p of this.state.getWebSockets("player")) if (!m.to || p.deserializeAttachment().id === m.to) p.send(msg);
    } else if (m.type === "buzz") {
      this.toHost({ type: "buzz", id: ws.deserializeAttachment().id, option: String(m.option).slice(0, 200), at: Date.now() });
    }
  }

  webSocketClose(ws) {
    if (this.state.getTags(ws).includes("host")) for (const p of this.state.getWebSockets("player")) p.send(JSON.stringify({ type: "screen-left" }));
    else this.toHost({ type: "leave", id: ws.deserializeAttachment().id });
  }
}
