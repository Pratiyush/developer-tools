import { translate } from '../../../lib/i18n';
import { copyButton, heroBlock, type CopyButtonHandle } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { textarea } from '../../../ui/primitives/textarea';
import { binaryToText, textToBinary } from './logic';
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
      eyebrowKey: 'tools.asciibin.eyebrow',
      heroKey: 'tools.asciibin.heading',
      ledeKey: 'tools.asciibin.intro',
      doc,
    }),
  );

  // Mode tabs
  const tabs = doc.createElement('div');
  tabs.classList.add('dt-base64__segmented');
  for (const m of ['encode', 'decode'] as const) {
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.classList.add('dt-base64__tab');
    if (m === state.mode) btn.classList.add('dt-base64__tab--active');
    btn.textContent =
      m === 'encode' ? translate('tools.asciibin.mode.encode') : translate('tools.asciibin.mode.decode');
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
    placeholder: translate('tools.asciibin.placeholder'),
    ariaLabel: translate('tools.asciibin.input.aria'),
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
  inBody.append(tabs, input);
  root.appendChild(panel({ num: 1, label: translate('tools.asciibin.input.label'), body: inBody, className: 'dt-base64__pane' }));

  const out = textarea({
    value: '',
    ariaLabel: translate('tools.asciibin.output.aria'),
    rows: 4,
    readonly: true,
  });
  out.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono');
  const copy: CopyButtonHandle = copyButton({ text: () => out.value, label: translate('tools.base64.copy') });
  copy.el.classList.add('dt-base64__copy');
  disposers.push(() => copy.dispose());
  const outBody = doc.createElement('div');
  outBody.classList.add('dt-base64__pane-body');
  outBody.appendChild(out);
  const foot = doc.createElement('div');
  foot.classList.add('dt-base64__pane-foot');
  foot.append(copy.el);
  outBody.appendChild(foot);
  root.appendChild(panel({ num: 2, label: translate('tools.asciibin.output.label'), body: outBody, className: 'dt-base64__pane' }));

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
    if (state.mode === 'encode') {
      out.value = textToBinary(state.input);
    } else {
      const r = binaryToText(state.input);
      out.value = r ?? '—';
    }
  }
}

export { DEFAULT_STATE };
