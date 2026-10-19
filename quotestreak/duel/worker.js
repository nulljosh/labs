// quotestreak-duel: /duel/ws?room=ABCD opens a WebSocket into that room's Durable Object.
// The room holds two players at most and relays every message to the other one; the game
// itself (which ten quotes, scoring) runs in the page. Hibernation keeps idle rooms free.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const room = (url.searchParams.get("room") || "").toUpperCase();
    if (url.pathname !== "/duel/ws" || !/^[A-Z]{4}$/.test(room)) return new Response("not found", { status: 404 });
    if (request.headers.get("Upgrade") !== "websocket") return new Response("expected a websocket", { status: 426 });
    return env.ROOMS.get(env.ROOMS.idFromName(room)).fetch(request);
  },
};

export class Room {
  constructor(state) { this.state = state; }

  async fetch() {
    const peers = this.state.getWebSockets();
    if (peers.length >= 2) return new Response("room full", { status: 409 });
    const [client, server] = Object.values(new WebSocketPair());
    this.state.acceptWebSocket(server);
    server.send(JSON.stringify({ type: "joined", host: peers.length === 0 }));
    for (const p of peers) p.send(JSON.stringify({ type: "opponent" }));
    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(ws, msg) {
    if (typeof msg !== "string" || msg.length > 2000) return;
    for (const p of this.state.getWebSockets()) if (p !== ws) p.send(msg);
  }

  webSocketClose(ws) {
    for (const p of this.state.getWebSockets()) if (p !== ws) p.send(JSON.stringify({ type: "left" }));
  }
}
