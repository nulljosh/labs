// ponytail: in-memory ledger, swap for Supabase table when persistence matters
const accounts = new Map([
  ["demo", { id: "demo", currency: "CAD", balanceCents: 1_000_00, tx: [] }],
]);

export function getAccount(id) {
  return accounts.get(id) ?? null;
}

export function post(id, amountCents, memo) {
  const a = accounts.get(id);
  if (!a) throw new Error("no such account");
  if (!Number.isInteger(amountCents)) throw new Error("amount must be integer cents");
  if (a.balanceCents + amountCents < 0) throw new Error("insufficient funds");
  a.balanceCents += amountCents;
  a.tx.push({ at: new Date().toISOString(), amountCents, memo });
  return a;
}
