import { translate } from '../../../lib/i18n';
import { copyButton, heroBlock, type CopyButtonHandle } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { input as inputPrim } from '../../../ui/primitives/input';
import { textarea } from '../../../ui/primitives/textarea';
import { decrypt, encrypt } from './logic';
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
      eyebrowKey: 'tools.encrypt.eyebrow',
      heroKey: 'tools.encrypt.heading',
      ledeKey: 'tools.encrypt.intro',
      doc,
    }),
  );

  // Mode + passphrase + input
  const inBody = doc.createElement('div');
  inBody.classList.add('dt-uuid__cfg');

  const tabs = doc.createElement('div');
  tabs.classList.add('dt-base64__segmented');
  for (const m of ['encrypt', 'decrypt'] as const) {
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.classList.add('dt-base64__tab');
    if (m === state.mode) btn.classList.add('dt-base64__tab--active');
    btn.textContent =
      m === 'encrypt' ? translate('tools.encrypt.mode.encrypt') : translate('tools.encrypt.mode.decrypt');
    btn.addEventListener('click', () => {
      state = { ...state, mode: m };
      for (const sib of tabs.querySelectorAll('button')) sib.classList.remove('dt-base64__tab--active');
      btn.classList.add('dt-base64__tab--active');
      runOp();
      options.onStateChange?.(state);
    });
    tabs.appendChild(btn);
  }
  inBody.appendChild(tabs);

  const passWrap = doc.createElement('div');
  passWrap.classList.add('dt-uuid__field');
  const passLabel = doc.createElement('span');
  passLabel.classList.add('dt-uuid__field-label');
  passLabel.textContent = translate('tools.encrypt.passphrase.label');
  const passEl = inputPrim({
    type: 'password',
    placeholder: translate('tools.encrypt.passphrase.placeholder'),
    ariaLabel: translate('tools.encrypt.passphrase.aria'),
    onInput: () => runOp(),
  });
  passWrap.append(passLabel, passEl);
  inBody.appendChild(passWrap);

  const ta = textarea({
    value: '',
    placeholder: translate('tools.encrypt.input.placeholder'),
    ariaLabel: translate('tools.encrypt.input.aria'),
    rows: 6,
    onInput: () => runOp(),
  });
  ta.classList.add('dt-base64__textarea');
  inBody.appendChild(ta);

  root.appendChild(
    panel({
      label: translate('tools.encrypt.input.label'),
      num: 1,
      body: inBody,
      className: 'dt-base64__pane',
    }),
  );

  // Output
  const out = textarea({
    value: '',
    ariaLabel: translate('tools.encrypt.output.aria'),
    rows: 6,
    readonly: true,
  });
  out.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono');
  const err = doc.createElement('div');
  err.classList.add('dt-jwt__error');
  err.style.display = 'none';

  const outBody = doc.createElement('div');
  outBody.classList.add('dt-base64__pane-body');
  outBody.append(err, out);

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

  root.appendChild(
    panel({
      label: translate('tools.encrypt.output.label'),
      num: 2,
      body: outBody,
      className: 'dt-base64__pane',
    }),
  );

  host.appendChild(root);

  let pending = 0;
  function runOp(): void {
    const myId = ++pending;
    out.value = '';
    err.style.display = 'none';
    if (!ta.value || !passEl.value) return;
    if (state.mode === 'encrypt') {
      void encrypt(ta.value, passEl.value).then((ct) => {
        if (myId !== pending) return;
        out.value = ct;
      });
    } else {
      void decrypt(ta.value, passEl.value).then((r) => {
        if (myId !== pending) return;
        if (r.ok && r.plaintext !== undefined) {
          out.value = r.plaintext;
        } else {
          err.textContent = r.error ?? 'failed';
          err.style.display = 'block';
        }
      });
    }
  }

  return {
    dispose(): void {
      for (const fn of disposers) fn();
      pending++;
      if (root.parentNode === host) host.removeChild(root);
    },
  };
}

export { DEFAULT_STATE };
