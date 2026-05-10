/**
 * `.dt-output` — pre-formatted output block. Uses `<pre><code>` so monospace
 * + whitespace preservation are inherited. `language` is written to
 * `data-language` for future syntax-highlight integration.
 */

export interface OutputOptions {
  readonly content: string;
  readonly language?: string;
  readonly ariaLabel?: string;
}

export function output(options: OutputOptions): HTMLPreElement {
  const root = document.createElement('pre');
  root.className = 'dt-output';
  if (options.language !== undefined) root.dataset.language = options.language;
  if (options.ariaLabel !== undefined) root.setAttribute('aria-label', options.ariaLabel);

  const code = document.createElement('code');
  code.className = 'dt-output__code';
  code.textContent = options.content;
  root.appendChild(code);

  return root;
}
