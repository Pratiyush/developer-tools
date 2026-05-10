/**
 * `.dt-kv-row` — a single key/value row with optional copy button.
 * Used as the building block for `kvList`.
 *
 * The copy-button primitive returns a handle with a `dispose()` method;
 * we expose a `KvRowHandle` that bundles the row element with that
 * disposer (a no-op when the row has no copy button).
 */

import { copyButton } from '../primitives/copy-button';

export interface KvRowOptions {
  readonly key: string;
  readonly value: string;
  readonly copyable?: boolean;
  readonly mono?: boolean;
}

export interface KvRowHandle {
  readonly el: HTMLDivElement;
  dispose(): void;
}

export function kvRow(options: KvRowOptions): KvRowHandle {
  const root = document.createElement('div');
  root.className = 'dt-kv-row';

  const keyEl = document.createElement('dt');
  keyEl.className = 'dt-kv-row__key';
  keyEl.textContent = options.key;
  root.appendChild(keyEl);

  const valueEl = document.createElement('dd');
  valueEl.className = 'dt-kv-row__value';
  if (options.mono === true) valueEl.classList.add('dt-kv-row__value--mono');
  valueEl.textContent = options.value;
  root.appendChild(valueEl);

  let dispose: () => void = noop;

  if (options.copyable === true) {
    const action = document.createElement('div');
    action.className = 'dt-kv-row__action';
    const handle = copyButton({ text: () => options.value });
    action.appendChild(handle.el);
    root.appendChild(action);
    dispose = () => handle.dispose();
  }

  return {
    el: root,
    dispose: () => dispose(),
  };
}

function noop(): void {
  // intentionally empty — used when there is nothing to dispose.
}
