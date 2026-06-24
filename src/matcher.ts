import type { Node } from "./types.js";

// Backtracking matcher. `k` is the continuation called with the index
// reached after this node matches; returns true if the whole match succeeds.
type Continuation = (index: number) => boolean;

function matchNode(node: Node, input: string, index: number, k: Continuation): boolean {
  switch (node.kind) {
    case "char":
      return input[index] === node.value && k(index + 1);
    case "any":
      return index < input.length && k(index + 1);
    case "concat": {
      const matchFrom = (i: number, idx: number): boolean =>
        i === node.nodes.length ? k(idx) : matchNode(node.nodes[i], input, idx, (next) => matchFrom(i + 1, next));
      return matchFrom(0, index);
    }
    case "alt":
      return matchNode(node.left, input, index, k) || matchNode(node.right, input, index, k);
    case "optional":
      return matchNode(node.node, input, index, k) || k(index);
    case "star":
      return matchNode(node.node, input, index, (next) => next > index && matchNode(node, input, next, k)) || k(index);
    case "plus":
      return matchNode(node.node, input, index, (next) => matchNode({ kind: "star", node: node.node }, input, next, k));
  }
}

export function matches(node: Node, input: string): boolean {
  // TODO: support anchors (^, $) instead of requiring a full-string match
  for (let start = 0; start <= input.length; start++) {
    if (matchNode(node, input, start, (end) => end === input.length)) return true;
  }
  return false;
}
