import { translate } from '../../../lib/i18n';
import { copyButton, heroBlock, type CopyButtonHandle } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { input as inputPrim } from '../../../ui/primitives/input';
import { formatDate, parseDateInput } from './logic';
import { DEFAULT_STATE, type State } from './url-state';

export interface RenderOptions {
  onStateChange?: (next: State) => void;
}

const ROWS = ['iso', 'utc', 'local', 'unixSeconds', 'unixMillis', 'rfc2822', 'relative'] as const;
const ROW_LABELS: Record<(typeof ROWS)[number], string> = {
  iso: 'ISO 8601',
  utc: 'UTC',
  local: 'Local',
  unixSeconds: 'Unix (s)',
  unixMillis: 'Unix (ms)',
  rfc2822: 'RFC 2822',
  relative: 'Relative',
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
      eyebrowKey: 'tools.datetime.eyebrow',
      heroKey: 'tools.datetime.heading',
      ledeKey: 'tools.datetime.intro',
      doc,
    }),
  );

  const inputEl = inputPrim({
    type: 'text',
    value: state.input,
    placeholder: '2024-06-15T12:00:00Z · 1700000000 · "now"',
    ariaLabel: translate('tools.datetime.input.aria'),
    onInput: (v) => {
      state = { ...state, input: v };
      refresh();
      options.onStateChange?.(state);
    },
  });

  const inBody = doc.createElement('div');
  inBody.classList.add('dt-base64__pane-body');
  inBody.appendChild(inputEl);
  root.appendChild(panel({ num: 1, label: translate('tools.datetime.input.label'), body: inBody, className: 'dt-base64__pane' }));

  const grid = doc.createElement('div');
  grid.classList.add('dt-case__grid');
  const cells = new Map<string, HTMLElement>();
  for (const r of ROWS) {
    const row = doc.createElement('div');
    row.classList.add('dt-case__row');
    const lbl = doc.createElement('span');
    lbl.classList.add('dt-case__label');
    lbl.textContent = ROW_LABELS[r];
    const val = doc.createElement('code');
    val.classList.add('dt-case__value');
    const copy: CopyButtonHandle = copyButton({ text: () => val.textContent ?? '', label: 'Copy' });
    copy.el.classList.add('dt-case__copy');
    disposers.push(() => copy.dispose());
    row.append(lbl, val, copy.el);
    grid.appendChild(row);
    cells.set(r, val);
  }

  const outBody = doc.createElement('div');
  outBody.classList.add('dt-base64__pane-body');
  outBody.appendChild(grid);
  root.appendChild(panel({ num: 2, label: translate('tools.datetime.output.label'), body: outBody, className: 'dt-base64__pane' }));

  host.appendChild(root);
  refresh();

  return {
    dispose(): void {
      for (const fn of disposers) fn();
      if (root.parentNode === host) host.removeChild(root);
    },
  };

  function refresh(): void {
    const r = state.input.trim() ? parseDateInput(state.input) : { date: new Date(), source: 'native' as const };
    if (!r) {
      for (const v of cells.values()) v.textContent = '—';
      return;
    }
    const f = formatDate(r.date);
    cells.get('iso')!.textContent = f.iso;
    cells.get('utc')!.textContent = f.utc;
    cells.get('local')!.textContent = f.local;
    cells.get('unixSeconds')!.textContent = f.unixSeconds;
    cells.get('unixMillis')!.textContent = f.unixMillis;
    cells.get('rfc2822')!.textContent = f.rfc2822;
    cells.get('relative')!.textContent = f.relative;
  }
}

export { DEFAULT_STATE };
