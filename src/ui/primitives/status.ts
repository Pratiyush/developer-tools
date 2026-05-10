/**
 * `.dt-status` — status badge. Tone drives color via `data-tone`; CSS picks
 * up the design token (e.g. `var(--dt-success)`).
 *
 * Markup:
 *   <span class="dt-status" data-tone="success">Active</span>
 */

export type StatusTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

export interface StatusOptions {
  readonly label: string;
  readonly tone?: StatusTone;
  readonly icon?: HTMLElement;
}

export function status(options: StatusOptions): HTMLSpanElement {
  const root = document.createElement('span');
  root.className = 'dt-status';
  root.dataset.tone = options.tone ?? 'neutral';
  if (options.icon !== undefined) {
    options.icon.classList.add('dt-status__icon');
    root.appendChild(options.icon);
  }
  const label = document.createElement('span');
  label.className = 'dt-status__label';
  label.textContent = options.label;
  root.appendChild(label);
  return root;
}
