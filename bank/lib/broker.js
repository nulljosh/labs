// Alpaca paper trading. Without keys, returns a simulated fill so dev works offline.
const BASE = "https://paper-api.alpaca.markets/v2";

export async function placeOrder({ symbol, qty, side }) {
  if (!symbol || !qty || !["buy", "sell"].includes(side)) throw new Error("bad order");
  const key = process.env.ALPACA_KEY;
  if (!key) {
    // ponytail: offline stub; real path below activates when keys are set
    return { id: crypto.randomUUID(), symbol, qty, side, status: "filled_simulated" };
  }
  const res = await fetch(`${BASE}/orders`, {
    method: "POST",
    headers: {
      "APCA-API-KEY-ID": key,
      "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET,
      "content-type": "application/json",
    },
    body: JSON.stringify({ symbol, qty: String(qty), side, type: "market", time_in_force: "day" }),
  });
  if (!res.ok) throw new Error(`alpaca ${res.status}: ${await res.text()}`);
  return res.json();
}
