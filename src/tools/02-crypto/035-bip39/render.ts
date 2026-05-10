import { translate } from '../../../lib/i18n';
import { button, copyButton, heroBlock, type CopyButtonHandle } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { textarea } from '../../../ui/primitives/textarea';
import { WORD_COUNTS, entropyHexFor, generate, isValid } from './logic';
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
      eyebrowKey: 'tools.bip39.eyebrow',
      heroKey: 'tools.bip39.heading',
      ledeKey: 'tools.bip39.intro',
      doc,
    }),
  );

  let mnemonic = generate(state.words);

  // Configuration: word count
  const cfgBody = doc.createElement('div');
  cfgBody.classList.add('dt-uuid__cfg');

  const wordsRow = doc.createElement('div');
  wordsRow.classList.add('dt-uuid__field');
  const wordsLabel = doc.createElement('span');
  wordsLabel.classList.add('dt-uuid__field-label');
  wordsLabel.textContent = translate('tools.bip39.words.label');
  const wordsSeg = doc.createElement('div');
  wordsSeg.classList.add('dt-base64__segmented');
  for (const w of WORD_COUNTS) {
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.classList.add('dt-base64__tab');
    if (w === state.words) btn.classList.add('dt-base64__tab--active');
    btn.textContent = String(w);
    btn.addEventListener('click', () => {
      state = { ...state, words: w };
      for (const sib of wordsSeg.querySelectorAll('button'))
        sib.classList.remove('dt-base64__tab--active');
      btn.classList.add('dt-base64__tab--active');
      regenerate();
      options.onStateChange?.(state);
    });
    wordsSeg.appendChild(btn);
  }
  wordsRow.append(wordsLabel, wordsSeg);
  cfgBody.appendChild(wordsRow);

  const regen = button({
    label: translate('tools.bip39.regenerate'),
    variant: 'primary',
    onClick: () => regenerate(),
  });
  cfgBody.appendChild(regen);

  root.appendChild(
    panel({
      label: translate('tools.bip39.config'),
      num: 1,
      body: cfgBody,
      className: 'dt-base64__pane',
    }),
  );

  // Output
  const out = textarea({
    value: mnemonic,
    ariaLabel: translate('tools.bip39.output.aria'),
    rows: 4,
    readonly: true,
  });
  out.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono');

  const outBody = doc.createElement('div');
  outBody.classList.add('dt-base64__pane-body');
  outBody.appendChild(out);

  const entropyHint = doc.createElement('div');
  entropyHint.classList.add('dt-uuid__field-label');
  entropyHint.style.color = 'var(--accent)';
  outBody.appendChild(entropyHint);

  const copyHandle: CopyButtonHandle = copyButton({
    text: () => out.value,
    label: translate('tools.bip39.copy'),
  });
  copyHandle.el.classList.add('dt-base64__copy');
  disposers.push(() => copyHandle.dispose());
  const foot = doc.createElement('div');
  foot.classList.add('dt-base64__pane-foot');
  foot.append(copyHandle.el);
  outBody.appendChild(foot);

  const warn = doc.createElement('p');
  warn.classList.add('dt-jwt__warn', 'dt-jwt__warn--strong');
  warn.textContent = translate('tools.bip39.warn');
  outBody.appendChild(warn);

  const outPane = panel({
    label: translate('tools.bip39.output.label'),
    num: 2,
    right: `${state.words} words`,
    body: outBody,
    className: 'dt-base64__pane',
  });
  const rightHint = outPane.querySelector<HTMLSpanElement>('.dt-panel__right');
  root.appendChild(outPane);

  refreshHints();
  host.appendChild(root);

  return {
    dispose(): void {
      for (const fn of disposers) fn();
      if (root.parentNode === host) host.removeChild(root);
    },
  };

  function regenerate(): void {
    mnemonic = generate(state.words);
    out.value = mnemonic;
    refreshHints();
  }
  function refreshHints(): void {
    if (rightHint) rightHint.textContent = `${state.words} words`;
    const valid = isValid(mnemonic);
    const hex = valid ? entropyHexFor(mnemonic) : null;
    entropyHint.textContent = hex ? `entropy = 0x${hex}` : '';
  }
}

export { DEFAULT_STATE };
