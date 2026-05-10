import { translate } from '../../../lib/i18n';
import { copyButton, heroBlock, type CopyButtonHandle } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { textarea } from '../../../ui/primitives/textarea';
import { format, minify } from './logic';
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
      eyebrowKey: 'tools.fmtjson.eyebrow',
      heroKey: 'tools.fmtjson.heading',
      ledeKey: 'tools.fmtjson.intro',
      doc,
    }),
  );

  // Mode tabs
  const tabs = doc.createElement('div');
  tabs.classList.add('dt-base64__segmented');
  for (const m of ['pretty', 'minify'] as const) {
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.classList.add('dt-base64__tab');
    if (m === state.mode) btn.classList.add('dt-base64__tab--active');
    btn.textContent =
      m === 'pretty' ? translate('tools.fmtjson.mode.pretty') : translate('tools.fmtjson.mode.minify');
    btn.addEventListener('click', () => {
      state = { ...state, mode: m };
      for (const sib of tabs.querySelectorAll('button')) sib.classList.remove('dt-base64__tab--active');
      btn.classList.add('dt-base64__tab--active');
      refresh();
      options.onStateChange?.(state);
    });
    tabs.appendChild(btn);
  }

  // Input
  const input = textarea({
    value: state.input,
    placeholder: translate('tools.fmtjson.placeholder'),
    ariaLabel: translate('tools.fmtjson.input.aria'),
    rows: 8,
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
  const inPane = panel({ num: 1, label: translate('tools.fmtjson.input.label'), body: inBody, className: 'dt-base64__pane' });
  const inLabelEl = inPane.querySelector<HTMLDivElement>('.dt-panel__label');
  const inRight = doc.createElement('span');
  inRight.classList.add('dt-panel__right');
  inLabelEl?.appendChild(inRight);
  root.appendChild(inPane);

  // Output
  const out = textarea({
    value: '',
    ariaLabel: translate('tools.fmtjson.output.aria'),
    rows: 12,
    readonly: true,
  });
  out.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono');

  const errBox = doc.createElement('div');
  errBox.classList.add('dt-jwt__error');
  errBox.style.display = 'none';

  const copy: CopyButtonHandle = copyButton({ text: () => out.value, label: translate('tools.base64.copy') });
  copy.el.classList.add('dt-base64__copy');
  disposers.push(() => copy.dispose());
  const outBody = doc.createElement('div');
  outBody.classList.add('dt-base64__pane-body');
  outBody.append(errBox, out);
  const foot = doc.createElement('div');
  foot.classList.add('dt-base64__pane-foot');
  foot.append(copy.el);
  outBody.appendChild(foot);
  root.appendChild(panel({ num: 2, label: translate('tools.fmtjson.output.label'), body: outBody, className: 'dt-base64__pane' }));

  host.appendChild(root);
  refresh();

  return {
    dispose(): void {
      for (const fn of disposers) fn();
      if (root.parentNode === host) host.removeChild(root);
    },
  };

  function refresh(): void {
    if (!state.input.trim()) {
      out.value = '';
      errBox.style.display = 'none';
      inRight.textContent = '';
      inRight.removeAttribute('data-status');
      return;
    }
    const r = state.mode === 'pretty' ? format(state.input, state.indent) : minify(state.input);
    if (r.ok) {
      out.value = r.output;
      errBox.style.display = 'none';
      inRight.textContent = 'valid JSON';
      inRight.dataset.status = 'ok';
    } else {
      out.value = '';
      errBox.textContent = r.error;
      errBox.style.display = 'block';
      inRight.textContent = 'parse error';
      inRight.dataset.status = 'err';
    }
  }
}

export { DEFAULT_STATE };
