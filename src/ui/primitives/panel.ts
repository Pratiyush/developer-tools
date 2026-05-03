export interface PanelOptions {
  label?: string;
  body: HTMLElement | DocumentFragment | string;
  className?: string;
}

export function panel(options: PanelOptions): HTMLElement {
  const el = document.createElement('section');
  el.classList.add('dt-panel');
  if (options.className) el.classList.add(options.className);

  if (options.label) {
    const label = document.createElement('div');
    label.classList.add('dt-panel__label');
    label.textContent = options.label;
    el.appendChild(label);
  }

  if (typeof options.body === 'string') {
    const wrap = document.createElement('div');
    wrap.textContent = options.body;
    el.appendChild(wrap);
  } else {
    el.appendChild(options.body);
  }

  return el;
}
