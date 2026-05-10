/**
 * `.dt-grid` — a CSS grid wrapper. `cols` controls column count;
 * `gap` selects a token-driven gap size (`sm` / `md` / `lg`).
 */

export type GridGap = 'sm' | 'md' | 'lg';

export interface GridOptions {
  readonly cols?: number;
  readonly gap?: GridGap;
  readonly children?: readonly HTMLElement[];
}

export function grid(options: GridOptions = {}): HTMLDivElement {
  const root = document.createElement('div');
  root.className = 'dt-grid';
  const cols = options.cols ?? 1;
  if (cols < 1) {
    root.dataset.cols = '1';
  } else {
    root.dataset.cols = String(cols);
  }
  root.dataset.gap = options.gap ?? 'md';
  if (options.children !== undefined) {
    for (const child of options.children) root.appendChild(child);
  }
  return root;
}
