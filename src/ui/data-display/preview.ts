/**
 * `.dt-preview` — rendered preview pane. The contents are appended as DOM
 * (no innerHTML), so callers control sanitization. Optional caption
 * is rendered above the content as a subtle label.
 */

export interface PreviewOptions {
  readonly caption?: string;
  readonly content: HTMLElement;
}

export function preview(options: PreviewOptions): HTMLDivElement {
  const root = document.createElement('div');
  root.className = 'dt-preview';

  if (options.caption !== undefined) {
    const captionEl = document.createElement('span');
    captionEl.className = 'dt-preview__caption';
    captionEl.textContent = options.caption;
    root.appendChild(captionEl);
  }

  const body = document.createElement('div');
  body.className = 'dt-preview__body';
  body.appendChild(options.content);
  root.appendChild(body);

  return root;
}
