/**
 * Builds a CSS selector identifying `el`, preferring its `id` when present.
 * Falls back to a short tag/nth-of-type path from `el` up toward (not
 * including) `<body>`, capped at 5 levels — enough to disambiguate a
 * clicked element for a future Test Case without over-fitting to exact
 * DOM structure.
 */
export function buildSelector(el: Element): string {
  if (el.id) return `#${el.id}`;

  const parts: string[] = [];
  let current: Element | null = el;

  while (
    current &&
    current.tagName.toLowerCase() !== "body" &&
    parts.length < 5
  ) {
    let part = current.tagName.toLowerCase();
    const parent: Element | null = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (c) => c.tagName === current!.tagName,
      );
      if (siblings.length > 1) {
        part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
      }
    }
    parts.unshift(part);
    current = parent;
  }

  return parts.join(" > ");
}
