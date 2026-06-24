export type Node =
  | { kind: "char"; value: string }
  | { kind: "any" }
  | { kind: "concat"; nodes: Node[] }
  | { kind: "alt"; left: Node; right: Node }
  | { kind: "star"; node: Node }
  | { kind: "plus"; node: Node }
  | { kind: "optional"; node: Node };
