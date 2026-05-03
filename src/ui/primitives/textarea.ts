export interface TextareaOptions {
  value?: string;
  placeholder?: string;
  ariaLabel?: string;
  rows?: number;
  readonly?: boolean;
  onInput?: (value: string) => void;
}

export function textarea(options: TextareaOptions = {}): HTMLTextAreaElement {
  const el = document.createElement('textarea');
  el.classList.add('dt-textarea');
  el.value = options.value ?? '';
  el.rows = options.rows ?? 5;
  if (options.placeholder) el.placeholder = options.placeholder;
  if (options.ariaLabel) el.setAttribute('aria-label', options.ariaLabel);
  if (options.readonly) el.readOnly = true;
  if (options.onInput) {
    const handler = options.onInput;
    el.addEventListener('input', () => {
      handler(el.value);
    });
  }
  return el;
}
