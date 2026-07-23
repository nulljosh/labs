"use client";
import { useEffect, useState } from "react";

const fmt = (c) => `$${(c / 100).toFixed(2)}`;

export default function Home() {
  const [acct, setAcct] = useState(null);
  const [form, setForm] = useState({ symbol: "AAPL", qty: 1, side: "buy" });
  const [msg, setMsg] = useState("");

  const load = () => fetch("/api/accounts").then((r) => r.json()).then(setAcct);
  useEffect(() => { load(); }, []);

  async function trade(e) {
    e.preventDefault();
    setMsg("…");
    const res = await fetch("/api/trade", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...form, qty: Number(form.qty) }),
    });
    const data = await res.json();
    setMsg(res.ok ? `${data.status}: ${form.side} ${form.qty} ${form.symbol}` : `error: ${data.error}`);
    load();
  }

  const s = { border: "1px solid #ccc", padding: "6px 8px", fontSize: 15 };
  return (
    <main style={{ maxWidth: 560, margin: "40px auto", fontFamily: "system-ui", padding: "0 16px" }}>
      <h1 style={{ fontSize: 22 }}>bank</h1>
      <p style={{ color: "#666" }}>Sandbox only. No real money.</p>
      {acct && (
        <>
          <h2 style={{ fontSize: 32, margin: "8px 0" }}>{fmt(acct.balanceCents)} <small style={{ fontSize: 14, color: "#666" }}>{acct.currency}</small></h2>
          <form onSubmit={trade} style={{ display: "flex", gap: 8, margin: "16px 0" }}>
            <input style={{ ...s, width: 90 }} value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })} aria-label="Symbol" />
            <input style={{ ...s, width: 70 }} type="number" min="1" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} aria-label="Quantity" />
            <select style={s} value={form.side} onChange={(e) => setForm({ ...form, side: e.target.value })} aria-label="Side">
              <option>buy</option>
              <option>sell</option>
            </select>
            <button style={{ ...s, cursor: "pointer", background: "#111", color: "#fff", border: 0 }}>Trade</button>
          </form>
          {msg && <p>{msg}</p>}
          <h3 style={{ fontSize: 15, marginTop: 24 }}>Activity</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <tbody>
              {[...acct.tx].reverse().map((t, i) => (
                <tr key={i} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: "6px 0" }}>{t.memo}</td>
                  <td style={{ textAlign: "right", color: t.amountCents < 0 ? "#b00" : "#070" }}>{fmt(t.amountCents)}</td>
                </tr>
              ))}
              {!acct.tx.length && <tr><td style={{ padding: "6px 0", color: "#999" }}>No activity yet</td></tr>}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
}
