import { placeOrder } from "../../../lib/broker.js";
import { post } from "../../../lib/ledger.js";

export async function POST(req) {
  let order;
  try {
    order = await placeOrder(await req.json());
  } catch (e) {
    return Response.json({ error: e.message }, { status: 400 });
  }
  // ponytail: naive $100/share placeholder until quotes are wired
  const cost = order.side === "buy" ? -100_00 * order.qty : 100_00 * order.qty;
  post("demo", cost, `${order.side} ${order.qty} ${order.symbol}`);
  return Response.json(order);
}
