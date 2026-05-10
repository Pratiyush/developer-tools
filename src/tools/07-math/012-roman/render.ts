import { translate } from '../../../lib/i18n';
import { copyButton, heroBlock, type CopyButtonHandle } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { textarea } from '../../../ui/primitives/textarea';
import { fromRoman, toRoman } from './logic';
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
      eyebrowKey: 'tools.roman.eyebrow',
      heroKey: 'tools.roman.heading',
      ledeKey: 'tools.roman.intro',
      doc,
    }),
  );

  // Mode tabs
  const tabs = doc.createElement('div');
  tabs.classList.add('dt-base64__segmented');
  tabs.setAttribute('role', 'tablist');
  for (const m of ['toRoman', 'fromRoman'] as const) {
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.classList.add('dt-base64__tab');
    if (m === state.mode) btn.classList.add('dt-base64__tab--active');
    btn.setAttribute('role', 'tab');
    btn.textContent =
      m === 'toRoman' ? translate('tools.roman.mode.encode') : translate('tools.roman.mode.decode');
    btn.addEventListener('click', () => {
      state = { ...state, mode: m };
      for (const sib of tabs.querySelectorAll('button')) sib.classList.remove('dt-base64__tab--active');
      btn.classList.add('dt-base64__tab--active');
      refresh();
      options.onStateChange?.(state);
    });
    tabs.appendChild(btn);
  }

  const input = textarea({
    value: state.input,
    placeholder: translate('tools.roman.placeholder'),
    ariaLabel: translate('tools.roman.input.aria'),
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
  inBody.append(tabs, input);
  root.appendChild(panel({ num: 1, label: translate('tools.roman.input.label'), body: inBody, className: 'dt-base64__pane' }));

  const out = textarea({
    value: '',
    ariaLabel: translate('tools.roman.output.aria'),
    rows: 2,
    readonly: true,
  });
  out.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono');
  const copy: CopyButtonHandle = copyButton({ text: () => out.value, label: translate('tools.base64.copy') });
  copy.el.classList.add('dt-base64__copy');
  disposers.push(() => copy.dispose());
  const outBody = doc.createElement('div');
  outBody.classList.add('dt-base64__pane-body');
  outBody.appendChild(out);
  const outFoot = doc.createElement('div');
  outFoot.classList.add('dt-base64__pane-foot');
  outFoot.append(copy.el);
  outBody.appendChild(outFoot);
  root.appendChild(panel({ num: 2, label: translate('tools.roman.output.label'), body: outBody, className: 'dt-base64__pane' }));

  host.appendChild(root);
  refresh();

  return {
    dispose(): void {
      for (const fn of disposers) fn();
      if (root.parentNode === host) host.removeChild(root);
    },
  };

  function refresh(): void {
    if (!state.input) {
      out.value = '';
      return;
    }
    if (state.mode === 'toRoman') {
      const n = Number(state.input.trim());
      const r = Number.isFinite(n) ? toRoman(n) : null;
      out.value = r ?? '—';
    } else {
      const n = fromRoman(state.input);
      out.value = n === null ? '—' : String(n);
    }
  }
}

export { DEFAULT_STATE };
