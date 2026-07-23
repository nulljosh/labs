import { getAccount } from "../../../lib/ledger.js";

export function GET() {
  return Response.json(getAccount("demo"));
}
