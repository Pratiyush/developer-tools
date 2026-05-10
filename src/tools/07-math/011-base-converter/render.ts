import { translate } from '../../../lib/i18n';
import { copyButton, heroBlock, type CopyButtonHandle } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { textarea } from '../../../ui/primitives/textarea';
import { COMMON_BASES, formatInBase, parseInBase, type Base } from './logic';
import { DEFAULT_STATE, type State } from './url-state';

export interface RenderOptions {
  onStateChange?: (next: State) => void;
}

const BASE_LABELS: Record<Base, string> = {
  2: 'Binary',
  8: 'Octal',
  10: 'Decimal',
  16: 'Hexadecimal',
  36: 'Base 36',
};

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
      eyebrowKey: 'tools.baseconv.eyebrow',
      heroKey: 'tools.baseconv.heading',
      ledeKey: 'tools.baseconv.intro',
      doc,
    }),
  );

  // Mode + input
  const modes = doc.createElement('div');
  modes.classList.add('dt-base64__segmented');
  modes.setAttribute('role', 'tablist');
  for (const b of COMMON_BASES) {
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.classList.add('dt-base64__tab');
    if (b === state.from) btn.classList.add('dt-base64__tab--active');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', b === state.from ? 'true' : 'false');
    btn.textContent = BASE_LABELS[b];
    btn.addEventListener('click', () => {
      state = { ...state, from: b };
      for (const sib of modes.querySelectorAll('button')) {
        sib.classList.remove('dt-base64__tab--active');
        sib.setAttribute('aria-selected', 'false');
      }
      btn.classList.add('dt-base64__tab--active');
      btn.setAttribute('aria-selected', 'true');
      refresh();
      options.onStateChange?.(state);
    });
    modes.appendChild(btn);
  }

  const input = textarea({
    value: state.input,
    placeholder: translate('tools.baseconv.placeholder'),
    ariaLabel: translate('tools.baseconv.input.aria'),
    rows: 2,
    onInput: (v) => {
      state = { ...state, input: v };
      refresh();
      options.onStateChange?.(state);
    },
  });
  input.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono');

  const inBody = doc.createElement('div');
  inBody.classList.add('dt-base64__pane-body');
  inBody.append(modes, input);
  const inPane = panel({
    num: 1,
    label: translate('tools.baseconv.input.label'),
    body: inBody,
    className: 'dt-base64__pane',
  });
  root.appendChild(inPane);

  // Output rows — one per common base
  const outBody = doc.createElement('div');
  outBody.classList.add('dt-case__grid');
  const outRows = new Map<Base, HTMLElement>();
  for (const b of COMMON_BASES) {
    const row = doc.createElement('div');
    row.classList.add('dt-case__row');
    const lbl = doc.createElement('span');
    lbl.classList.add('dt-case__label');
    lbl.textContent = BASE_LABELS[b];
    const val = doc.createElement('code');
    val.classList.add('dt-case__value');
    const copy: CopyButtonHandle = copyButton({ text: () => val.textContent ?? '', label: 'Copy' });
    copy.el.classList.add('dt-case__copy');
    disposers.push(() => copy.dispose());
    row.append(lbl, val, copy.el);
    outBody.appendChild(row);
    outRows.set(b, val);
  }
  const outPane = panel({
    num: 2,
    label: translate('tools.baseconv.output.label'),
    body: outBody,
    className: 'dt-base64__pane',
  });
  root.appendChild(outPane);

  host.appendChild(root);
  refresh();

  return {
    dispose(): void {
      for (const fn of disposers) fn();
      if (root.parentNode === host) host.removeChild(root);
    },
  };

  function refresh(): void {
    const n = parseInBase(state.input, state.from);
    for (const b of COMMON_BASES) {
      const cell = outRows.get(b);
      if (cell) cell.textContent = n === null ? '—' : formatInBase(n, b);
    }
  }
}

export { DEFAULT_STATE };
