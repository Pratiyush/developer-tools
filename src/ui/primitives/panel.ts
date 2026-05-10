export interface PanelOptions {
  label?: string;
  /** Optional zero-padded number prefix shown in mono before the label —
   *  e.g. `01` renders as `01 · Configuration`. Matches the v3 editorial
   *  spec where every tool's panels are numbered. */
  num?: string | number;
  /** Optional right-aligned hint chip — e.g. `auto-updating`,
   *  `8 ids · 296 chars`, `UTF-8 · 31 chars · 31 bytes`. Sits flush right
   *  in the label row. */
  right?: string;
  body: HTMLElement | DocumentFragment | string;
  className?: string;
}

export function panel(options: PanelOptions): HTMLElement {
  const el = document.createElement('section');
  el.classList.add('dt-panel');
  if (options.className) el.classList.add(options.className);

  if (options.label || options.num !== undefined || options.right) {
    const label = document.createElement('div');
    label.classList.add('dt-panel__label');

    if (options.num !== undefined) {
      const num = document.createElement('span');
      num.classList.add('dt-panel__num');
      num.textContent = String(options.num).padStart(2, '0');
      label.appendChild(num);
    }
    if (options.label) {
      const labelText = document.createElement('span');
      labelText.classList.add('dt-panel__label-text');
      labelText.textContent = options.label;
      label.appendChild(labelText);
    }
    if (options.right) {
      const right = document.createElement('span');
      right.classList.add('dt-panel__right');
      right.textContent = options.right;
      label.appendChild(right);
    }
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
