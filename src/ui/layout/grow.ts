/**
 * `.dt-grow` — wrapper that flex-grows to fill remaining space. Pair with
 * `dt-push` for asymmetric layouts, or use alone when one child needs
 * to dominate the row.
 */

export interface GrowOptions {
  readonly children?: readonly HTMLElement[];
}

export function grow(options: GrowOptions = {}): HTMLDivElement {
  const root = document.createElement('div');
  root.className = 'dt-grow';
  if (options.children !== undefined) {
    for (const child of options.children) root.appendChild(child);
  }
  return root;
}
