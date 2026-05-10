export interface InputOptions {
  value?: string;
  placeholder?: string;
  ariaLabel?: string;
  type?: 'text' | 'search' | 'password' | 'number' | 'email';
  onInput?: (value: string) => void;
}

export function input(options: InputOptions = {}): HTMLInputElement {
  const el = document.createElement('input');
  el.classList.add('dt-input');
  el.type = options.type ?? 'text';
  el.value = options.value ?? '';
  if (options.placeholder) el.placeholder = options.placeholder;
  if (options.ariaLabel) el.setAttribute('aria-label', options.ariaLabel);
  if (options.onInput) {
    const handler = options.onInput;
    el.addEventListener('input', () => {
      handler(el.value);
    });
  }
  return el;
}
