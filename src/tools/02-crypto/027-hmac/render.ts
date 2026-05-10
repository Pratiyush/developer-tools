import { translate } from '../../../lib/i18n';
import { copyButton, heroBlock, type CopyButtonHandle } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { input as inputPrim } from '../../../ui/primitives/input';
import { textarea } from '../../../ui/primitives/textarea';
import { ALGORITHMS, hmac } from './logic';
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
      eyebrowKey: 'tools.hmac.eyebrow',
      heroKey: 'tools.hmac.heading',
      ledeKey: 'tools.hmac.intro',
      doc,
    }),
  );

  // Inputs — message + secret + algorithm
  const inBody = doc.createElement('div');
  inBody.classList.add('dt-uuid__cfg');

  const algoWrap = doc.createElement('div');
  algoWrap.classList.add('dt-uuid__field');
  const algoLabel = doc.createElement('span');
  algoLabel.classList.add('dt-uuid__field-label');
  algoLabel.textContent = translate('tools.hmac.algo.label');
  const algoSeg = doc.createElement('div');
  algoSeg.classList.add('dt-base64__segmented');
  algoSeg.setAttribute('role', 'tablist');
  for (const a of ALGORITHMS) {
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.classList.add('dt-base64__tab');
    if (a === state.algo) btn.classList.add('dt-base64__tab--active');
    btn.textContent = a;
    btn.addEventListener('click', () => {
      state = { ...state, algo: a };
      for (const sib of algoSeg.querySelectorAll('button'))
        sib.classList.remove('dt-base64__tab--active');
      btn.classList.add('dt-base64__tab--active');
      schedule();
      options.onStateChange?.(state);
    });
    algoSeg.appendChild(btn);
  }
  algoWrap.append(algoLabel, algoSeg);
  inBody.appendChild(algoWrap);

  const secretWrap = doc.createElement('div');
  secretWrap.classList.add('dt-uuid__field');
  const secretLabel = doc.createElement('span');
  secretLabel.classList.add('dt-uuid__field-label');
  secretLabel.textContent = translate('tools.hmac.secret.label');
  const secretEl = inputPrim({
    type: 'password',
    value: state.secret,
    placeholder: translate('tools.hmac.secret.placeholder'),
    ariaLabel: translate('tools.hmac.secret.aria'),
    onInput: (v) => {
      state = { ...state, secret: v };
      schedule();
      options.onStateChange?.(state);
    },
  });
  secretWrap.append(secretLabel, secretEl);
  inBody.appendChild(secretWrap);

  const msgWrap = doc.createElement('div');
  msgWrap.classList.add('dt-uuid__field');
  const msgLabel = doc.createElement('span');
  msgLabel.classList.add('dt-uuid__field-label');
  msgLabel.textContent = translate('tools.hmac.message.label');
  const msgEl = textarea({
    value: state.message,
    placeholder: translate('tools.hmac.message.placeholder'),
    ariaLabel: translate('tools.hmac.message.aria'),
    rows: 5,
    onInput: (v) => {
      state = { ...state, message: v };
      schedule();
      options.onStateChange?.(state);
    },
  });
  msgEl.classList.add('dt-base64__textarea');
  msgWrap.append(msgLabel, msgEl);
  inBody.appendChild(msgWrap);

  root.appendChild(
    panel({
      label: translate('tools.hmac.input.label'),
      num: 1,
      body: inBody,
      className: 'dt-base64__pane',
    }),
  );

  const out = textarea({
    value: '',
    ariaLabel: translate('tools.hmac.output.aria'),
    rows: 4,
    readonly: true,
  });
  out.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono');

  const outBody = doc.createElement('div');
  outBody.classList.add('dt-base64__pane-body');
  outBody.appendChild(out);

  const copyHandle: CopyButtonHandle = copyButton({
    text: () => out.value,
    label: translate('tools.base64.copy'),
  });
  copyHandle.el.classList.add('dt-base64__copy');
  disposers.push(() => copyHandle.dispose());
  const foot = doc.createElement('div');
  foot.classList.add('dt-base64__pane-foot');
  foot.append(copyHandle.el);
  outBody.appendChild(foot);

  const outPane = panel({
    label: translate('tools.hmac.output.label'),
    num: 2,
    right: '— bytes',
    body: outBody,
    className: 'dt-base64__pane',
  });
  const rightHint = outPane.querySelector<HTMLSpanElement>('.dt-panel__right');
  root.appendChild(outPane);

  host.appendChild(root);

  let pendingId = 0;
  function schedule(): void {
    const myId = ++pendingId;
    if (!state.message && !state.secret) {
      out.value = '';
      if (rightHint) rightHint.textContent = '— bytes';
      return;
    }
    void hmac(state.message, state.secret, state.algo).then((sig) => {
      if (myId !== pendingId) return;
      out.value = sig;
      if (rightHint) rightHint.textContent = `${sig.length / 2} bytes`;
    });
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

export { DEFAULT_STATE };
