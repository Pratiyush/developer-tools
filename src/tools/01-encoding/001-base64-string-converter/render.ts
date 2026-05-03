import { translate } from '../../../lib/i18n';
import { button } from '../../../ui/primitives/button';
import { copyButton, type CopyButtonHandle } from '../../../ui/primitives/copy-button';
import { panel } from '../../../ui/primitives/panel';
import { textarea } from '../../../ui/primitives/textarea';
import { base64ToText, isValidBase64, textToBase64 } from './logic';
import { type Mode, type State } from './url-state';

export interface RenderOptions {
  /** Optional callback fired whenever the user changes anything we want
   *  reflected in the URL. The host wires this to the URL-state plumbing. */
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

  // Root container
  const root = doc.createElement('div');
  root.classList.add('dt-base64');

  // Mode tabs (encode | decode)
  const tabs = doc.createElement('div');
  tabs.classList.add('dt-base64__tabs');
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', translate('tools.base64.mode.aria'));

  const encodeTab = makeTab('encode', translate('tools.base64.mode.encode'));
  const decodeTab = makeTab('decode', translate('tools.base64.mode.decode'));
  tabs.append(encodeTab, decodeTab);
  root.appendChild(tabs);

  // URL-safe toggle
  const toggleWrap = doc.createElement('label');
  toggleWrap.classList.add('dt-base64__toggle');
  const toggleInput = doc.createElement('input');
  toggleInput.type = 'checkbox';
  toggleInput.checked = state.urlsafe;
  toggleInput.setAttribute('aria-label', translate('tools.base64.urlsafe.aria'));
  const toggleText = doc.createElement('span');
  toggleText.textContent = translate('tools.base64.urlsafe.label');
  toggleWrap.append(toggleInput, toggleText);
  root.appendChild(toggleWrap);

  toggleInput.addEventListener('change', () => {
    update({ urlsafe: toggleInput.checked });
  });

  // Input panel
  const inputArea = textarea({
    value: state.input,
    placeholder: translate('tools.base64.input.placeholder'),
    ariaLabel: translate('tools.base64.input.aria'),
    rows: 6,
    onInput: (value) => {
      update({ input: value });
    },
  });
  const inputBody = doc.createElement('div');
  inputBody.appendChild(inputArea);
  const inputPanel = panel({
    label: translate('tools.base64.input.label'),
    body: inputBody,
    className: 'dt-base64__panel',
  });
  root.appendChild(inputPanel);

  // Swap button (label already contains ⇄ — no separate icon needed)
  const swap = button({
    label: translate('tools.base64.swap'),
    onClick: () => {
      const decoded = computeOutput(state);
      // Move output → input and flip mode.
      const nextMode: Mode = state.mode === 'encode' ? 'decode' : 'encode';
      update({ mode: nextMode, input: decoded });
      // Sync DOM (textarea + tabs).
      inputArea.value = decoded;
      setActiveTab(nextMode);
    },
  });
  swap.classList.add('dt-base64__swap');
  root.appendChild(swap);

  // Output panel
  const outputArea = textarea({
    value: '',
    ariaLabel: translate('tools.base64.output.aria'),
    rows: 6,
    readonly: true,
  });

  const lengths = doc.createElement('span');
  lengths.classList.add('dt-base64__lengths');

  const copyHandle: CopyButtonHandle = copyButton({
    text: () => outputArea.value,
    label: translate('tools.base64.copy'),
  });
  disposers.push(() => {
    copyHandle.dispose();
  });

  const outputBody = doc.createElement('div');
  outputBody.appendChild(outputArea);
  const outputFoot = doc.createElement('div');
  outputFoot.classList.add('dt-base64__output-foot');
  outputFoot.append(lengths, copyHandle.el);
  outputBody.appendChild(outputFoot);

  const outputPanel = panel({
    label: translate('tools.base64.output.label'),
    body: outputBody,
    className: 'dt-base64__panel',
  });
  root.appendChild(outputPanel);

  // Initial paint
  setActiveTab(state.mode);
  refreshOutput();

  host.appendChild(root);

  return {
    dispose(): void {
      for (const fn of disposers) fn();
      if (root.parentNode === host) host.removeChild(root);
    },
  };

  // ─── helpers ────────────────────────────────────────────────────────────

  function makeTab(id: Mode, label: string): HTMLButtonElement {
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.classList.add('dt-base64__tab');
    btn.dataset.mode = id;
    btn.setAttribute('role', 'tab');
    btn.textContent = label;
    btn.addEventListener('click', () => {
      update({ mode: id });
    });
    return btn;
  }

  function setActiveTab(mode: Mode): void {
    for (const tab of [encodeTab, decodeTab]) {
      const isActive = tab.dataset.mode === mode;
      tab.classList.toggle('dt-base64__tab--active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    }
  }

  function update(patch: Partial<State>): void {
    const next: State = { ...state, ...patch };
    state = next;
    setActiveTab(next.mode);
    if (toggleInput.checked !== next.urlsafe) {
      toggleInput.checked = next.urlsafe;
    }
    if (inputArea.value !== next.input) {
      inputArea.value = next.input;
    }
    refreshOutput();
    options.onStateChange?.(next);
  }

  function refreshOutput(): void {
    const value = computeOutput(state);
    outputArea.value = value;
    const inLen = state.input.length;
    const outLen = value.length;
    lengths.textContent = translate('tools.base64.lengths', {
      in: String(inLen),
      out: String(outLen),
    });
  }
}

/** Pure: returns the encoded/decoded string for a given state.
 *  Errors during decode produce an empty string (UI shows length 0). */
function computeOutput(state: State): string {
  if (state.input === '') return '';
  if (state.mode === 'encode') {
    return textToBase64(state.input, { makeUrlSafe: state.urlsafe });
  }
  // decode mode — guard against partial / malformed input (no exception popups)
  if (!isValidBase64(state.input, { makeUrlSafe: state.urlsafe })) {
    return '';
  }
  try {
    return base64ToText(state.input, { makeUrlSafe: state.urlsafe });
  } catch {
    return '';
  }
}
