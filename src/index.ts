import { Parser } from "./parser.js";
import { matches } from "./matcher.js";

export function test(pattern: string, input: string): boolean {
  const ast = new Parser(pattern).parse();
  return matches(ast, input);
}
