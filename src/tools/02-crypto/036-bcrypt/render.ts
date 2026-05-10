import { translate } from '../../../lib/i18n';
import { copyButton, heroBlock, type CopyButtonHandle } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { input as inputPrim } from '../../../ui/primitives/input';
import { textarea } from '../../../ui/primitives/textarea';
import { COST_MAX, COST_MIN, costOf, hashPassword, verifyPassword } from './logic';
import { DEFAULT_STATE, type Mode, type State } from './url-state';

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
      eyebrowKey: 'tools.bcrypt.eyebrow',
      heroKey: 'tools.bcrypt.heading',
      ledeKey: 'tools.bcrypt.intro',
      doc,
    }),
  );

  // Mode tabs (hash | verify)
  const tabs = doc.createElement('div');
  tabs.classList.add('dt-base64__segmented');
  tabs.setAttribute('role', 'tablist');
  const modeBtns: Record<Mode, HTMLButtonElement> = {
    hash: doc.createElement('button'),
    verify: doc.createElement('button'),
  };
  for (const m of ['hash', 'verify'] as const) {
    const btn = modeBtns[m];
    btn.type = 'button';
    btn.classList.add('dt-base64__tab');
    if (m === state.mode) btn.classList.add('dt-base64__tab--active');
    btn.textContent =
      m === 'hash' ? translate('tools.bcrypt.mode.hash') : translate('tools.bcrypt.mode.verify');
    btn.addEventListener('click', () => {
      state = { ...state, mode: m };
      for (const sib of tabs.querySelectorAll('button'))
        sib.classList.remove('dt-base64__tab--active');
      btn.classList.add('dt-base64__tab--active');
      refresh();
      options.onStateChange?.(state);
    });
    tabs.appendChild(btn);
  }

  // Cost slider — only matters in `hash` mode but always rendered.
  const costWrap = doc.createElement('div');
  costWrap.classList.add('dt-uuid__field');
  const costLabel = doc.createElement('span');
  costLabel.classList.add('dt-uuid__field-label');
  const costSlider = doc.createElement('input');
  costSlider.type = 'range';
  costSlider.min = String(COST_MIN);
  costSlider.max = String(COST_MAX);
  costSlider.step = '1';
  costSlider.value = String(state.cost);
  const costSummary = doc.createElement('span');
  costSummary.classList.add('dt-uuid__field-label');
  function updateCostLabel(): void {
    const c = Number(costSlider.value);
    const iter = Math.pow(2, c);
    costLabel.textContent = translate('tools.bcrypt.cost.label', { cost: String(c) });
    costSummary.textContent = `2^${c} = ${iter.toLocaleString()} iterations`;
  }
  updateCostLabel();
  costSlider.addEventListener('input', () => {
    state = { ...state, cost: Number(costSlider.value) };
    updateCostLabel();
    options.onStateChange?.(state);
  });
  costWrap.append(costLabel, costSlider, costSummary);

  // Password input
  const pwdWrap = doc.createElement('div');
  pwdWrap.classList.add('dt-uuid__field');
  const pwdLabel = doc.createElement('span');
  pwdLabel.classList.add('dt-uuid__field-label');
  pwdLabel.textContent = translate('tools.bcrypt.password.label');
  let password = '';
  const pwdEl = inputPrim({
    type: 'password',
    value: '',
    placeholder: translate('tools.bcrypt.password.placeholder'),
    ariaLabel: translate('tools.bcrypt.password.aria'),
    onInput: (v) => {
      password = v;
      refresh();
    },
  });
  pwdWrap.append(pwdLabel, pwdEl);

  // Verify mode: an extra "hash to compare" textarea
  const verifyWrap = doc.createElement('div');
  verifyWrap.classList.add('dt-uuid__field');
  const verifyLabel = doc.createElement('span');
  verifyLabel.classList.add('dt-uuid__field-label');
  verifyLabel.textContent = translate('tools.bcrypt.verify.label');
  let verifyHash = '';
  const verifyEl = textarea({
    value: '',
    placeholder: translate('tools.bcrypt.verify.placeholder'),
    ariaLabel: translate('tools.bcrypt.verify.aria'),
    rows: 2,
    onInput: (v) => {
      verifyHash = v;
      refresh();
    },
  });
  verifyEl.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono');
  verifyWrap.append(verifyLabel, verifyEl);

  const inBody = doc.createElement('div');
  inBody.classList.add('dt-uuid__cfg');
  inBody.append(tabs, costWrap, pwdWrap, verifyWrap);
  root.appendChild(
    panel({
      label: translate('tools.bcrypt.input.label'),
      num: 1,
      body: inBody,
      className: 'dt-base64__pane',
    }),
  );

  // Output panel
  const out = textarea({
    value: '',
    ariaLabel: translate('tools.bcrypt.output.aria'),
    rows: 3,
    readonly: true,
  });
  out.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono');

  const status = doc.createElement('div');
  status.classList.add('dt-uuid__field-label');

  const outBody = doc.createElement('div');
  outBody.classList.add('dt-base64__pane-body');
  outBody.append(status, out);

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
    label: translate('tools.bcrypt.output.label'),
    num: 2,
    body: outBody,
    className: 'dt-base64__pane',
  });
  root.appendChild(outPane);

  let pendingId = 0;

  host.appendChild(root);
  refresh();

  function refresh(): void {
    // Toggle field visibility
    costWrap.style.display = state.mode === 'hash' ? '' : 'none';
    verifyWrap.style.display = state.mode === 'verify' ? '' : 'none';

    const myId = ++pendingId;
    if (!password) {
      out.value = '';
      status.textContent = '';
      return;
    }
    if (state.mode === 'hash') {
      status.textContent = translate('tools.bcrypt.status.hashing');
      void hashPassword(password, state.cost).then((h) => {
        if (myId !== pendingId) return;
        out.value = h;
        const c = costOf(h);
        status.textContent = translate('tools.bcrypt.status.hashed', {
          cost: String(c ?? state.cost),
        });
      });
    } else {
      out.value = '';
      if (!verifyHash.trim()) {
        status.textContent = '';
        return;
      }
      status.textContent = translate('tools.bcrypt.status.verifying');
      void verifyPassword(password, verifyHash).then((ok) => {
        if (myId !== pendingId) return;
        status.textContent = ok
          ? translate('tools.bcrypt.status.match')
          : translate('tools.bcrypt.status.mismatch');
      });
    }
  }

  return {
    dispose(): void {
      for (const fn of disposers) fn();
      pendingId++;
      if (root.parentNode === host) host.removeChild(root);
    },
  };
}

export { DEFAULT_STATE };
