/**
 * The document or shadow root an element lives in. The board also runs inside a
 * shadow root (the public site's live boards, src/embed), where `document` only
 * sees the shadow host: focus and hit tests must ask the element's own root.
 */
function rootOf(node: Node): Document | ShadowRoot {
  const root = node.getRootNode()
  return root instanceof ShadowRoot ? root : document
}

/** The focused element in the same root as `node`. */
export function activeElementIn(node: Node): Element | null {
  return rootOf(node).activeElement
}

/** The topmost element at a viewport point, looking inside `node`'s root. */
export function elementAt(node: Node, x: number, y: number): Element | null {
  return rootOf(node).elementFromPoint(x, y)
}
