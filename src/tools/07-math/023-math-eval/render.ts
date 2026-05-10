import { translate } from '../../../lib/i18n';
import { copyButton, heroBlock, type CopyButtonHandle } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { input as inputPrim } from '../../../ui/primitives/input';
import { evaluate } from './logic';
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
      eyebrowKey: 'tools.matheval.eyebrow',
      heroKey: 'tools.matheval.heading',
      ledeKey: 'tools.matheval.intro',
      doc,
    }),
  );

  const inputEl = inputPrim({
    type: 'text',
    value: state.input,
    placeholder: '2 ** 10 + sqrt(16) - pi',
    ariaLabel: translate('tools.matheval.input.aria'),
    onInput: (v) => {
      state = { ...state, input: v };
      refresh();
      options.onStateChange?.(state);
    },
  });

  const inBody = doc.createElement('div');
  inBody.classList.add('dt-base64__pane-body');
  inBody.appendChild(inputEl);
  root.appendChild(panel({ num: 1, label: translate('tools.matheval.input.label'), body: inBody, className: 'dt-base64__pane' }));

  const big = doc.createElement('div');
  big.classList.add('dt-chmod__big');
  const err = doc.createElement('div');
  err.classList.add('dt-jwt__error');
  err.style.display = 'none';

  const copy: CopyButtonHandle = copyButton({
    text: () => big.textContent ?? '',
    label: translate('tools.base64.copy'),
  });
  copy.el.classList.add('dt-base64__copy');
  disposers.push(() => copy.dispose());

  const outBody = doc.createElement('div');
  outBody.classList.add('dt-base64__pane-body');
  outBody.append(big, err);
  const foot = doc.createElement('div');
  foot.classList.add('dt-base64__pane-foot');
  foot.append(copy.el);
  outBody.appendChild(foot);
  root.appendChild(panel({ num: 2, label: translate('tools.matheval.output.label'), body: outBody, className: 'dt-base64__pane' }));

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
      big.textContent = '';
      err.style.display = 'none';
      return;
    }
    const r = evaluate(state.input);
    if (r.ok) {
      big.textContent = String(r.value);
      err.style.display = 'none';
    } else {
      big.textContent = '—';
      err.textContent = r.error;
      err.style.display = 'block';
    }
  }
}

export { DEFAULT_STATE };
