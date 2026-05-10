/**
 * Hash tool render — v3 anatomy panel: every supported SHA digest is
 * computed in parallel and shown in its own row with a per-row copy
 * button. Saves the user from clicking a tab to compare algorithms.
 */

import { translate } from '../../../lib/i18n';
import { copyButton, heroBlock, type CopyButtonHandle } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { textarea } from '../../../ui/primitives/textarea';
import { ALGORITHMS, hashText } from './logic';
import { DEFAULT_STATE, type State } from './url-state';

export interface RenderOptions {
  onStateChange?: (next: State) => void;
}

export function render(
  host: HTMLElement,
  initial: State,
  options: RenderOptions = {},
): { dispose(): void } {
  const doc = host.ownerDocument;
  let state: State = { ...initial };
  const disposers: (() => void)[] = [];

  const root = doc.createElement('div');
  root.classList.add('dt-tool-page');

  root.appendChild(
    heroBlock({
      eyebrowKey: 'tools.hash.eyebrow',
      heroKey: 'tools.hash.heading',
      ledeKey: 'tools.hash.intro',
      doc,
    }),
  );

  // ─── Input panel ─────────────────────────────────────────────────────────
  const input = textarea({
    value: state.input,
    placeholder: translate('tools.hash.placeholder'),
    ariaLabel: translate('tools.hash.input.aria'),
    rows: 5,
    onInput: (v) => {
      state = { ...state, input: v };
      schedule();
      options.onStateChange?.(state);
    },
  });
  input.classList.add('dt-base64__textarea');

  const inBody = doc.createElement('div');
  inBody.classList.add('dt-base64__pane-body');
  inBody.appendChild(input);
  const inPane = panel({
    num: 1,
    label: translate('tools.hash.input.label'),
    body: inBody,
    className: 'dt-base64__pane',
  });
  const inRightHint = doc.createElement('span');
  inRightHint.classList.add('dt-panel__right');
  const inLabel = inPane.querySelector<HTMLDivElement>('.dt-panel__label');
  if (inLabel) inLabel.appendChild(inRightHint);
  root.appendChild(inPane);

  // ─── Anatomy panel — one row per algorithm ───────────────────────────────
  const anatomy = doc.createElement('div');
  anatomy.classList.add('dt-hash__anatomy');

  interface Row {
    algo: (typeof ALGORITHMS)[number];
    valueEl: HTMLElement;
    bytesEl: HTMLElement;
  }
  const rows: Row[] = [];
  const lastValue: Record<string, string> = {};

  for (const algo of ALGORITHMS) {
    const row = doc.createElement('div');
    row.classList.add('dt-hash__row');

    const head = doc.createElement('div');
    head.classList.add('dt-hash__row-head');
    const name = doc.createElement('span');
    name.classList.add('dt-hash__row-algo');
    name.textContent = algo;
    const bytes = doc.createElement('span');
    bytes.classList.add('dt-hash__row-bytes');
    bytes.textContent = `${digestBits(algo) / 8} bytes`;
    head.append(name, bytes);

    const valueWrap = doc.createElement('div');
    valueWrap.classList.add('dt-hash__row-value-wrap');
    const value = doc.createElement('code');
    value.classList.add('dt-hash__row-value');
    value.textContent = '—';
    valueWrap.appendChild(value);

    const copyHandle: CopyButtonHandle = copyButton({
      text: () => lastValue[algo] ?? '',
      label: translate('tools.base64.copy'),
    });
    copyHandle.el.classList.add('dt-hash__row-copy');
    disposers.push(() => copyHandle.dispose());

    const tail = doc.createElement('div');
    tail.classList.add('dt-hash__row-tail');
    tail.appendChild(copyHandle.el);

    row.append(head, valueWrap, tail);
    anatomy.appendChild(row);
    rows.push({ algo, valueEl: value, bytesEl: bytes });
  }

  const outPane = panel({
    num: 2,
    label: translate('tools.hash.output.label'),
    right: `${ALGORITHMS.length} algos`,
    body: anatomy,
    className: 'dt-base64__pane',
  });
  root.appendChild(outPane);

  host.appendChild(root);

  let pendingId = 0;
  function schedule(): void {
    const myId = ++pendingId;
    const text = state.input;
    const charCount = text.length;
    const byteCount = new TextEncoder().encode(text).length;
    inRightHint.textContent = text
      ? translate('tools.hash.input.hint', {
          chars: String(charCount),
          bytes: String(byteCount),
        })
      : '';
    if (!text) {
      for (const r of rows) {
        r.valueEl.textContent = '—';
        lastValue[r.algo] = '';
      }
      return;
    }
    for (const r of rows) {
      void hashText(text, r.algo).then((digest) => {
        if (myId !== pendingId) return;
        r.valueEl.textContent = digest;
        lastValue[r.algo] = digest;
      });
    }
  }
  schedule();

  return {
    dispose(): void {
      for (const fn of disposers) fn();
      pendingId++;
      if (root.parentNode === host) host.removeChild(root);
    },
  };
}

function digestBits(algo: (typeof ALGORITHMS)[number]): number {
  switch (algo) {
    case 'SHA-1':
      return 160;
    case 'SHA-256':
      return 256;
    case 'SHA-384':
      return 384;
    case 'SHA-512':
      return 512;
  }
}

export { DEFAULT_STATE };
