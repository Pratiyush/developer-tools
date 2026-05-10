import { translate } from '../../../lib/i18n';
import { copyButton, heroBlock, type CopyButtonHandle } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { input as inputPrim } from '../../../ui/primitives/input';
import { oklchToCss, parseColor, rgbToHex, rgbToHsl, rgbToOklch } from './logic';
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
      eyebrowKey: 'tools.color.eyebrow',
      heroKey: 'tools.color.heading',
      ledeKey: 'tools.color.intro',
      doc,
    }),
  );

  // Input + swatch
  const swatch = doc.createElement('div');
  swatch.classList.add('dt-color__swatch');

  const inputEl = inputPrim({
    type: 'text',
    value: state.input,
    placeholder: '#6366f1 · rgb(99, 102, 241) · hsl(239, 84%, 67%)',
    ariaLabel: translate('tools.color.input.aria'),
    onInput: (v) => {
      state = { ...state, input: v };
      refresh();
      options.onStateChange?.(state);
    },
  });

  const inBody = doc.createElement('div');
  inBody.classList.add('dt-base64__pane-body');
  inBody.append(swatch, inputEl);
  root.appendChild(panel({ num: 1, label: translate('tools.color.input.label'), body: inBody, className: 'dt-base64__pane' }));

  // Output rows
  const grid = doc.createElement('div');
  grid.classList.add('dt-case__grid');
  const rows = new Map<string, HTMLElement>();
  for (const fmt of ['hex', 'rgb', 'hsl', 'oklch']) {
    const row = doc.createElement('div');
    row.classList.add('dt-case__row');
    const lbl = doc.createElement('span');
    lbl.classList.add('dt-case__label');
    lbl.textContent = fmt.toUpperCase();
    const val = doc.createElement('code');
    val.classList.add('dt-case__value');
    const copy: CopyButtonHandle = copyButton({ text: () => val.textContent ?? '', label: 'Copy' });
    copy.el.classList.add('dt-case__copy');
    disposers.push(() => copy.dispose());
    row.append(lbl, val, copy.el);
    grid.appendChild(row);
    rows.set(fmt, val);
  }

  const outBody = doc.createElement('div');
  outBody.classList.add('dt-base64__pane-body');
  outBody.appendChild(grid);
  root.appendChild(panel({ num: 2, label: translate('tools.color.output.label'), body: outBody, className: 'dt-base64__pane' }));

  host.appendChild(root);
  refresh();

  return {
    dispose(): void {
      for (const fn of disposers) fn();
      if (root.parentNode === host) host.removeChild(root);
    },
  };

  function refresh(): void {
    const rgb = parseColor(state.input);
    if (!rgb) {
      swatch.style.background = 'transparent';
      for (const v of rows.values()) v.textContent = '—';
      return;
    }
    const hex = rgbToHex(rgb);
    const hsl = rgbToHsl(rgb);
    const oklch = rgbToOklch(rgb);
    swatch.style.background = hex;
    rows.get('hex')!.textContent = hex;
    rows.get('rgb')!.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    rows.get('hsl')!.textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    rows.get('oklch')!.textContent = oklchToCss(oklch);
  }
}

export { DEFAULT_STATE };
