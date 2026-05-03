import { translate } from '../../../lib/i18n';
import { copyButton, type CopyButtonHandle } from '../../../ui/primitives/copy-button';
import { panel } from '../../../ui/primitives/panel';
import { pasteButton, type PasteButtonHandle } from '../../../ui/primitives/paste-button';
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
  // No explicit aria-label — the wrapping <label> provides the accessible
  // name from the visible text, so screen-reader and visual users hear the
  // same thing. Setting aria-label here would override the visible text and
  // also break Playwright's getByLabel(/URL-safe variant/i) lookup.
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

  // ─── Two-pane workspace: source ⇄ result ───────────────────────────────
  // The source pane (left) is editable — text in encode mode, base64 in decode.
  // The result pane (right) is read-only and shows the converted form. The
  // visible labels swap with the mode so the header tells the user what kind
  // of content lives in each pane.
  const workspace = doc.createElement('div');
  workspace.classList.add('dt-base64__workspace');

  // Source (editable) pane
  const sourceArea = textarea({
    value: state.input,
    placeholder: placeholderFor(state.mode),
    ariaLabel: translate('tools.base64.source.aria'),
    rows: 10,
    onInput: (value) => {
      update({ input: value });
    },
  });
  sourceArea.classList.add('dt-base64__textarea');

  const sourcePaneBody = doc.createElement('div');
  sourcePaneBody.classList.add('dt-base64__pane-body');
  sourcePaneBody.appendChild(sourceArea);

  // Paste button on the source pane — symmetric with copy on the result pane
  const pasteHandle: PasteButtonHandle = pasteButton({
    label: translate('tools.base64.paste'),
    pastedLabel: translate('tools.base64.pasted'),
    onPaste: (text) => {
      sourceArea.value = text;
      update({ input: text });
      sourceArea.focus();
    },
    onError: () => {
      // Surface a transient hint via the textarea title — keeps us out of
      // alert/popup territory and respects the funny-but-informative rule.
      const previous = sourceArea.title;
      sourceArea.title = translate('error.paste.failed');
      setTimeout(() => {
        sourceArea.title = previous;
      }, 4000);
    },
  });
  pasteHandle.el.classList.add('dt-base64__paste');
  pasteHandle.el.setAttribute('aria-label', translate('tools.base64.paste.aria'));
  disposers.push(() => {
    pasteHandle.dispose();
  });

  const sourceFoot = doc.createElement('div');
  sourceFoot.classList.add('dt-base64__pane-foot');
  const sourceLengths = doc.createElement('span');
  sourceLengths.classList.add('dt-base64__lengths');
  sourceFoot.append(sourceLengths, pasteHandle.el);
  sourcePaneBody.appendChild(sourceFoot);

  const sourcePane = panel({
    label: sourceLabel(state.mode),
    body: sourcePaneBody,
    className: 'dt-base64__pane',
  });
  const sourceLabelEl = sourcePane.querySelector<HTMLDivElement>('.dt-panel__label');
  workspace.appendChild(sourcePane);

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
    sourceArea.value = computed;
    setActiveTab(nextMode);
  });
  workspace.appendChild(swap);

  // Result (read-only) pane — monospace because it's code-like content
  const resultArea = textarea({
    value: '',
    ariaLabel: translate('tools.base64.result.aria'),
    rows: 10,
    readonly: true,
  });
  resultArea.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono');

  const resultLengths = doc.createElement('span');
  resultLengths.classList.add('dt-base64__lengths');

  const copyHandle: CopyButtonHandle = copyButton({
    text: () => resultArea.value,
    label: translate('tools.base64.copy'),
  });
  copyHandle.el.classList.add('dt-base64__copy');
  disposers.push(() => {
    copyHandle.dispose();
  });

  const resultPaneBody = doc.createElement('div');
  resultPaneBody.classList.add('dt-base64__pane-body');
  resultPaneBody.appendChild(resultArea);

  const resultFoot = doc.createElement('div');
  resultFoot.classList.add('dt-base64__pane-foot');
  resultFoot.append(resultLengths, copyHandle.el);
  resultPaneBody.appendChild(resultFoot);

  const resultPane = panel({
    label: resultLabel(state.mode),
    body: resultPaneBody,
    className: 'dt-base64__pane',
  });
  const resultLabelEl = resultPane.querySelector<HTMLDivElement>('.dt-panel__label');
  workspace.appendChild(resultPane);

  root.appendChild(workspace);

  // ─── Explainer (how Base64 works, worked example, common uses) ────────
  root.appendChild(buildExplainer(doc));

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
    const modeChanged = next.mode !== state.mode;
    state = next;
    setActiveTab(next.mode);
    if (toggleInput.checked !== next.urlsafe) {
      toggleInput.checked = next.urlsafe;
    }
    if (sourceArea.value !== next.input) {
      sourceArea.value = next.input;
    }
    if (modeChanged) {
      if (sourceLabelEl) sourceLabelEl.textContent = sourceLabel(next.mode);
      if (resultLabelEl) resultLabelEl.textContent = resultLabel(next.mode);
      sourceArea.placeholder = placeholderFor(next.mode);
    }
    refreshOutput();
    options.onStateChange?.(next);
  }

  function refreshOutput(): void {
    const value = computeOutput(state);
    resultArea.value = value;
    const inLen = state.input.length;
    const outLen = value.length;
    sourceLengths.textContent = translate('tools.base64.chars', { n: String(inLen) });
    resultLengths.textContent = translate('tools.base64.chars', { n: String(outLen) });
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

function sourceLabel(mode: Mode): string {
  return mode === 'encode'
    ? translate('tools.base64.label.text')
    : translate('tools.base64.label.base64');
}

function resultLabel(mode: Mode): string {
  return mode === 'encode'
    ? translate('tools.base64.label.base64')
    : translate('tools.base64.label.text');
}

function placeholderFor(mode: Mode): string {
  return mode === 'encode'
    ? translate('tools.base64.placeholder.encode')
    : translate('tools.base64.placeholder.decode');
}

/** Builds the explainer block — heading, prose paragraphs, a worked example
 *  table, and a deep link to the Basic Auth helper. The example bytes/bits
 *  are universal and stay in code (not i18n) so they render the same in
 *  every locale. */
function buildExplainer(doc: Document): HTMLElement {
  const section = doc.createElement('section');
  section.classList.add('dt-base64__explainer');

  // Use h1 — the tool view doesn't otherwise have a level-one heading, so
  // axe's page-has-heading-one best-practice rule fails without it.
  const heading = doc.createElement('h1');
  heading.classList.add('dt-base64__explainer-h');
  heading.textContent = translate('tools.base64.explainer.heading');
  section.appendChild(heading);

  section.appendChild(makeP(doc, translate('tools.base64.explainer.intro')));
  section.appendChild(makeP(doc, translate('tools.base64.explainer.mechanic')));

  const exampleLabel = doc.createElement('p');
  exampleLabel.classList.add('dt-base64__explainer-eg-label');
  exampleLabel.textContent = translate('tools.base64.explainer.example.label');
  section.appendChild(exampleLabel);

  // Worked example: "Cat" → 0x43 0x61 0x74 → 6-bit groups → Q2F0
  const example = doc.createElement('pre');
  example.classList.add('dt-base64__explainer-eg');
  example.setAttribute('aria-label', 'Worked example: encoding "Cat" to Q2F0');
  example.textContent = [
    'input    C        a        t',
    'bytes    01000011 01100001 01110100',
    '6-bit    010000   110110   000101   110100',
    'index    16       54       5        52',
    'output   Q        2        F        0',
  ].join('\n');
  section.appendChild(example);

  section.appendChild(makeP(doc, translate('tools.base64.explainer.uses')));

  const warn = doc.createElement('p');
  warn.classList.add('dt-base64__explainer-warn');
  warn.textContent = translate('tools.base64.explainer.warning');
  section.appendChild(warn);

  const tryAuth = doc.createElement('a');
  tryAuth.classList.add('dt-base64__explainer-cta');
  tryAuth.href = '#/base64-basic-auth';
  tryAuth.textContent = translate('tools.base64.explainer.tryauth');
  section.appendChild(tryAuth);

  return section;
}

function makeP(doc: Document, text: string): HTMLParagraphElement {
  const p = doc.createElement('p');
  p.classList.add('dt-base64__explainer-p');
  // Inline `code` formatting — split on backticks and wrap odd indices.
  const parts = text.split('`');
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    if (part === undefined) continue;
    if (i % 2 === 0) {
      p.appendChild(doc.createTextNode(part));
    } else {
      const code = doc.createElement('code');
      code.textContent = part;
      p.appendChild(code);
    }
  }
  return p;
}
