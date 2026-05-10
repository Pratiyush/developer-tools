import { translate } from '../../../lib/i18n';
import { copyButton, heroBlock, type CopyButtonHandle } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { textarea } from '../../../ui/primitives/textarea';
import { CASES, CASE_LABELS, toCase, type Case } from './logic';
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
      eyebrowKey: 'tools.case.eyebrow',
      heroKey: 'tools.case.heading',
      ledeKey: 'tools.case.intro',
      doc,
    }),
  );

  // Input
  const input = textarea({
    value: state.input,
    placeholder: translate('tools.case.placeholder'),
    ariaLabel: translate('tools.case.input.aria'),
    rows: 4,
    onInput: (v) => {
      state = { ...state, input: v };
      refresh();
      options.onStateChange?.(state);
    },
  });
  input.classList.add('dt-base64__textarea');

  const inBody = doc.createElement('div');
  inBody.classList.add('dt-base64__pane-body');
  inBody.appendChild(input);
  const inPane = panel({
    num: 1,
    label: translate('tools.case.input.label'),
    body: inBody,
    className: 'dt-base64__pane',
  });
  root.appendChild(inPane);

  // Output grid — one row per case
  const grid = doc.createElement('div');
  grid.classList.add('dt-case__grid');

  const rows = new Map<Case, { value: HTMLElement; copy: CopyButtonHandle }>();
  for (const c of CASES) {
    const row = doc.createElement('div');
    row.classList.add('dt-case__row');
    const label = doc.createElement('span');
    label.classList.add('dt-case__label');
    label.textContent = CASE_LABELS[c];
    const value = doc.createElement('code');
    value.classList.add('dt-case__value');
    const copy = copyButton({
      text: () => value.textContent ?? '',
      label: 'Copy',
    });
    copy.el.classList.add('dt-case__copy');
    disposers.push(() => copy.dispose());
    row.append(label, value, copy.el);
    grid.appendChild(row);
    rows.set(c, { value, copy });
  }

  const outBody = doc.createElement('div');
  outBody.classList.add('dt-base64__pane-body');
  outBody.appendChild(grid);
  const outPane = panel({
    num: 2,
    label: translate('tools.case.output.label'),
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
    for (const c of CASES) {
      const row = rows.get(c);
      if (row) row.value.textContent = toCase(state.input, c);
    }
  }
}

export { DEFAULT_STATE };
