import { translate } from '../../../lib/i18n';
import { button, copyButton, heroBlock, type CopyButtonHandle } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { textarea } from '../../../ui/primitives/textarea';
import { PRESETS, alphabetFor, entropyBits, generateToken } from './logic';
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
      eyebrowKey: 'tools.token.eyebrow',
      heroKey: 'tools.token.heading',
      ledeKey: 'tools.token.intro',
      doc,
    }),
  );

  let token = generateToken(state.length, alphabetFor(state.preset));

  // ─── Configuration panel (01) ─────────────────────────────────────────
  const cfgBody = doc.createElement('div');
  cfgBody.classList.add('dt-uuid__cfg');

  // Alphabet preset segmented
  const presetWrap = doc.createElement('div');
  presetWrap.classList.add('dt-uuid__field');
  const presetLabel = doc.createElement('span');
  presetLabel.classList.add('dt-uuid__field-label');
  presetLabel.textContent = translate('tools.token.preset.label');
  const presetSeg = doc.createElement('div');
  presetSeg.classList.add('dt-base64__segmented');
  presetSeg.setAttribute('role', 'radiogroup');
  for (const p of PRESETS) {
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.classList.add('dt-base64__tab');
    if (p === state.preset) btn.classList.add('dt-base64__tab--active');
    btn.setAttribute('role', 'radio');
    btn.textContent = p;
    btn.addEventListener('click', () => {
      state = { ...state, preset: p };
      for (const sib of presetSeg.querySelectorAll('button'))
        sib.classList.remove('dt-base64__tab--active');
      btn.classList.add('dt-base64__tab--active');
      regenerate();
      options.onStateChange?.(state);
    });
    presetSeg.appendChild(btn);
  }
  presetWrap.append(presetLabel, presetSeg);
  cfgBody.appendChild(presetWrap);

  // Length slider
  const lenWrap = doc.createElement('label');
  lenWrap.classList.add('dt-uuid__field');
  const lenLabel = doc.createElement('span');
  lenLabel.classList.add('dt-uuid__field-label');
  const lenValue = doc.createElement('span');
  lenValue.classList.add('dt-uuid__field-value');
  lenValue.textContent = String(state.length);
  lenLabel.append(
    doc.createTextNode(`${translate('tools.token.length.label')} · `),
    lenValue,
  );
  const lenInput = doc.createElement('input');
  lenInput.type = 'range';
  lenInput.min = '8';
  lenInput.max = '256';
  lenInput.value = String(state.length);
  lenInput.addEventListener('input', () => {
    state = { ...state, length: Number(lenInput.value) };
    lenValue.textContent = String(state.length);
    regenerate();
    options.onStateChange?.(state);
  });
  lenWrap.append(lenLabel, lenInput);
  cfgBody.appendChild(lenWrap);

  // Entropy hint chip — recomputed on every regenerate.
  const entropyHint = doc.createElement('div');
  entropyHint.classList.add('dt-uuid__field-label');
  entropyHint.style.color = 'var(--accent)';
  cfgBody.appendChild(entropyHint);

  const cfgPane = panel({
    label: translate('tools.token.config.label'),
    num: 1,
    body: cfgBody,
    className: 'dt-base64__pane',
  });

  // ─── Output panel (02) ─────────────────────────────────────────────────
  const out = textarea({
    value: token,
    ariaLabel: translate('tools.token.output.aria'),
    rows: 4,
    readonly: true,
  });
  out.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono');

  const outBody = doc.createElement('div');
  outBody.classList.add('dt-base64__pane-body');
  outBody.appendChild(out);

  const regen = button({
    label: translate('tools.token.regenerate'),
    variant: 'primary',
    onClick: () => regenerate(),
  });
  regen.classList.add('dt-base64__copy');
  const copyHandle: CopyButtonHandle = copyButton({
    text: () => out.value,
    label: translate('tools.token.copy'),
  });
  copyHandle.el.classList.add('dt-base64__copy');
  disposers.push(() => copyHandle.dispose());
  const foot = doc.createElement('div');
  foot.classList.add('dt-base64__pane-foot');
  foot.append(regen, copyHandle.el);
  outBody.appendChild(foot);

  // Build the output panel; we'll bind a ref to the right-hint span via
  // the panel-num__right we pass through. To make right=hint live, we
  // mutate the rendered element's `.dt-panel__right` text on each regen.
  const outPane = panel({
    label: translate('tools.token.output.label'),
    num: 2,
    right: '— bits',
    body: outBody,
    className: 'dt-base64__pane',
  });
  const rightHint = outPane.querySelector<HTMLSpanElement>('.dt-panel__right');

  const workspace = doc.createElement('div');
  workspace.classList.add('dt-uuid__workspace');
  workspace.append(cfgPane, outPane);
  root.appendChild(workspace);

  host.appendChild(root);
  refreshHints();

  return {
    dispose(): void {
      for (const fn of disposers) fn();
      if (root.parentNode === host) host.removeChild(root);
    },
  };

  function regenerate(): void {
    token = generateToken(state.length, alphabetFor(state.preset));
    out.value = token;
    refreshHints();
  }
  function refreshHints(): void {
    const e = entropyBits(state.length, alphabetFor(state.preset));
    entropyHint.textContent = `≈ ${e.toFixed(0)} bits of entropy`;
    if (rightHint) rightHint.textContent = `${e.toFixed(0)} bits`;
  }
}

export { DEFAULT_STATE };
