import { translate } from '../../../lib/i18n';
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

  // Root
  const root = doc.createElement('div');
  root.classList.add('dt-base64');

  // ─── Top control bar: segmented mode tabs + URL-safe toggle ────────────
  const controls = doc.createElement('div');
  controls.classList.add('dt-base64__controls');

  const tabs = doc.createElement('div');
  tabs.classList.add('dt-base64__segmented');
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', translate('tools.base64.mode.aria'));
  const encodeTab = makeTab('encode', translate('tools.base64.mode.encode'));
  const decodeTab = makeTab('decode', translate('tools.base64.mode.decode'));
  tabs.append(encodeTab, decodeTab);
  controls.appendChild(tabs);

  // URL-safe toggle — custom switch styling
  const toggleWrap = doc.createElement('label');
  toggleWrap.classList.add('dt-base64__switch');
  const toggleInput = doc.createElement('input');
  toggleInput.type = 'checkbox';
  toggleInput.classList.add('dt-base64__switch-input');
  toggleInput.checked = state.urlsafe;
  toggleInput.setAttribute('aria-label', translate('tools.base64.urlsafe.aria'));
  const toggleVisual = doc.createElement('span');
  toggleVisual.classList.add('dt-base64__switch-visual');
  toggleVisual.setAttribute('aria-hidden', 'true');
  const toggleText = doc.createElement('span');
  toggleText.classList.add('dt-base64__switch-label');
  toggleText.textContent = translate('tools.base64.urlsafe.label');
  toggleWrap.append(toggleInput, toggleVisual, toggleText);
  controls.appendChild(toggleWrap);

  toggleInput.addEventListener('change', () => {
    update({ urlsafe: toggleInput.checked });
  });

  root.appendChild(controls);

  // ─── Two-pane workspace: input ⇄ output ────────────────────────────────
  const workspace = doc.createElement('div');
  workspace.classList.add('dt-base64__workspace');

  // Input pane
  const inputArea = textarea({
    value: state.input,
    placeholder: translate('tools.base64.input.placeholder'),
    ariaLabel: translate('tools.base64.input.aria'),
    rows: 10,
    onInput: (value) => {
      update({ input: value });
    },
  });
  inputArea.classList.add('dt-base64__textarea');

  const inputPaneBody = doc.createElement('div');
  inputPaneBody.classList.add('dt-base64__pane-body');
  inputPaneBody.appendChild(inputArea);

  const inputPane = panel({
    label: translate('tools.base64.input.label'),
    body: inputPaneBody,
    className: 'dt-base64__pane',
  });
  workspace.appendChild(inputPane);

  // Swap button — circular icon between panes
  const swap = doc.createElement('button');
  swap.type = 'button';
  swap.classList.add('dt-base64__swap');
  swap.setAttribute('aria-label', translate('tools.base64.swap'));
  swap.title = translate('tools.base64.swap');
  swap.innerHTML = '<span aria-hidden="true">⇄</span>';
  swap.addEventListener('click', () => {
    const computed = computeOutput(state);
    const nextMode: Mode = state.mode === 'encode' ? 'decode' : 'encode';
    update({ mode: nextMode, input: computed });
    inputArea.value = computed;
    setActiveTab(nextMode);
  });
  workspace.appendChild(swap);

  // Output pane (monospace — output is code)
  const outputArea = textarea({
    value: '',
    ariaLabel: translate('tools.base64.output.aria'),
    rows: 10,
    readonly: true,
  });
  outputArea.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono');

  const lengths = doc.createElement('span');
  lengths.classList.add('dt-base64__lengths');

  const copyHandle: CopyButtonHandle = copyButton({
    text: () => outputArea.value,
    label: translate('tools.base64.copy'),
  });
  copyHandle.el.classList.add('dt-base64__copy');
  disposers.push(() => {
    copyHandle.dispose();
  });

  const outputPaneBody = doc.createElement('div');
  outputPaneBody.classList.add('dt-base64__pane-body');
  outputPaneBody.appendChild(outputArea);

  const outputFoot = doc.createElement('div');
  outputFoot.classList.add('dt-base64__pane-foot');
  outputFoot.append(lengths, copyHandle.el);
  outputPaneBody.appendChild(outputFoot);

  const outputPane = panel({
    label: translate('tools.base64.output.label'),
    body: outputPaneBody,
    className: 'dt-base64__pane',
  });
  workspace.appendChild(outputPane);

  root.appendChild(workspace);

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
