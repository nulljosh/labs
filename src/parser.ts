import type { Node } from "./types.js";

// Recursive-descent parser for a small regex subset:
//   expr   := term ('|' term)*
//   term   := factor*
//   factor := atom ('*' | '+' | '?')?
//   atom   := '.' | char | '(' expr ')'
export class Parser {
  private pos = 0;

  constructor(private readonly pattern: string) {}

  parse(): Node {
    const node = this.parseExpr();
    if (this.pos !== this.pattern.length) {
      throw new Error(`Unexpected character at position ${this.pos}`);
    }
    return node;
  }

  private parseExpr(): Node {
    let node = this.parseTerm();
    while (this.peek() === "|") {
      this.pos++;
      node = { kind: "alt", left: node, right: this.parseTerm() };
    }
    return node;
  }

  private parseTerm(): Node {
    const nodes: Node[] = [];
    while (this.pos < this.pattern.length && this.peek() !== "|" && this.peek() !== ")") {
      nodes.push(this.parseFactor());
    }
    return nodes.length === 1 ? nodes[0] : { kind: "concat", nodes };
  }

  private parseFactor(): Node {
    let node = this.parseAtom();
    const quantifier = this.peek();
    if (quantifier === "*" || quantifier === "+" || quantifier === "?") {
      this.pos++;
      node =
        quantifier === "*"
          ? { kind: "star", node }
          : quantifier === "+"
            ? { kind: "plus", node }
            : { kind: "optional", node };
    }
    return node;
  }

  private parseAtom(): Node {
    const c = this.peek();
    if (c === "(") {
      this.pos++;
      const node = this.parseExpr();
      if (this.peek() !== ")") throw new Error("Expected ')'");
      this.pos++;
      return node;
    }
    if (c === ".") {
      this.pos++;
      return { kind: "any" };
    }
    this.pos++;
    return { kind: "char", value: c };
  }

  private peek(): string {
    return this.pattern[this.pos];
  }
}
