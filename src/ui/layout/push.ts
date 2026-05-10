/**
 * `.dt-push` — invisible flex spacer that pushes everything after it to
 * the end of the line via `margin-left: auto`. Common pattern: header
 * with title + push + actions.
 */

export function push(): HTMLDivElement {
  const root = document.createElement('div');
  root.className = 'dt-push';
  root.setAttribute('aria-hidden', 'true');
  return root;
}
