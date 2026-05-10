import { translate } from '../../../lib/i18n';
import { copyButton, type CopyButtonHandle } from '../../../ui/primitives/copy-button';
import { panel } from '../../../ui/primitives/panel';
import { pasteButton, type PasteButtonHandle } from '../../../ui/primitives/paste-button';
import { textarea } from '../../../ui/primitives/textarea';
import { countEscapes, decode, encode } from './logic';
import { type Mode, type State } from './url-state';

export interface RenderOptions {
  onStateChange?: (next: State) => void;
}

/**
 * Two-pane URL encoder/decoder. Reuses the base64 layout shell so
 * everything inherits the workspace styling without a fresh CSS module.
 *
 * Three controls along the top bar:
 *   - Encode / Decode tabs (mode)
 *   - URI vs component toggle (encode-only — hidden in decode)
 *   - Plus-for-space toggle (form-encoded)
 */
export function render(
  host: HTMLElement,
  initial: State,
  options: RenderOptions = {},
): { dispose(): void } {
  const doc = host.ownerDocument;
  let state: State = { ...initial };
  const disposers: (() => void)[] = [];

  const root = doc.createElement('div');
  root.classList.add('dt-base64'); // Reuse the base64 layout shell.

  // ─── Heading + intro ───────────────────────────────────────────────────
  const heading = doc.createElement('h1');
  heading.classList.add('dt-basicauth__heading');
  heading.textContent = translate('tools.urlenc.heading');
  root.appendChild(heading);

  const intro = doc.createElement('p');
  intro.classList.add('dt-basicauth__intro');
  appendInline(intro, translate('tools.urlenc.intro'));
  root.appendChild(intro);

  // ─── Top control bar: mode tabs + variant + plus toggle ───────────────
  const controls = doc.createElement('div');
  controls.classList.add('dt-base64__controls');

  const tabs = doc.createElement('div');
  tabs.classList.add('dt-base64__segmented');
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', translate('tools.urlenc.mode.aria'));
  const encodeTab = makeTab('encode', translate('tools.urlenc.mode.encode'));
  const decodeTab = makeTab('decode', translate('tools.urlenc.mode.decode'));
  tabs.append(encodeTab, decodeTab);
  controls.appendChild(tabs);

  // Variant switch — visible in encode mode only.
  const variantWrap = doc.createElement('label');
  variantWrap.classList.add('dt-base64__switch');
  const variantInput = doc.createElement('input');
  variantInput.type = 'checkbox';
  variantInput.classList.add('dt-base64__switch-input');
  variantInput.checked = state.variant === 'uri';
  const variantVisual = doc.createElement('span');
  variantVisual.classList.add('dt-base64__switch-visual');
  variantVisual.setAttribute('aria-hidden', 'true');
  const variantText = doc.createElement('span');
  variantText.classList.add('dt-base64__switch-label');
  variantText.textContent = translate('tools.urlenc.variant.label');
  variantWrap.append(variantInput, variantVisual, variantText);
  controls.appendChild(variantWrap);

  variantInput.addEventListener('change', () => {
    update({ variant: variantInput.checked ? 'uri' : 'component' });
  });

  // Plus-for-space switch — relevant in both modes.
  const plusWrap = doc.createElement('label');
  plusWrap.classList.add('dt-base64__switch');
  const plusInput = doc.createElement('input');
  plusInput.type = 'checkbox';
  plusInput.classList.add('dt-base64__switch-input');
  plusInput.checked = state.plus;
  const plusVisual = doc.createElement('span');
  plusVisual.classList.add('dt-base64__switch-visual');
  plusVisual.setAttribute('aria-hidden', 'true');
  const plusText = doc.createElement('span');
  plusText.classList.add('dt-base64__switch-label');
  plusText.textContent = translate('tools.urlenc.plus.label');
  plusWrap.append(plusInput, plusVisual, plusText);
  controls.appendChild(plusWrap);

  plusInput.addEventListener('change', () => {
    update({ plus: plusInput.checked });
  });

  root.appendChild(controls);

  // ─── Two-pane workspace ───────────────────────────────────────────────
  const workspace = doc.createElement('div');
  workspace.classList.add('dt-base64__workspace');

  // Source (editable)
  const sourceArea = textarea({
    value: state.input,
    placeholder: placeholderFor(state.mode),
    ariaLabel: translate('tools.urlenc.source.aria'),
    rows: 10,
    onInput: (value) => {
      update({ input: value });
    },
  });
  sourceArea.classList.add('dt-base64__textarea');

  const sourcePaneBody = doc.createElement('div');
  sourcePaneBody.classList.add('dt-base64__pane-body');
  sourcePaneBody.appendChild(sourceArea);

  const pasteHandle: PasteButtonHandle = pasteButton({
    label: translate('tools.base64.paste'),
    pastedLabel: translate('tools.base64.pasted'),
    onPaste: (text) => {
      sourceArea.value = text;
      update({ input: text });
      sourceArea.focus();
    },
    onError: () => {
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
    num: 1,
    label: sourceLabel(state.mode),
    body: sourcePaneBody,
    className: 'dt-base64__pane',
  });
  const sourceLabelEl = sourcePane.querySelector<HTMLDivElement>('.dt-panel__label');
  workspace.appendChild(sourcePane);

  // Swap (mode flip + content swap)
  const swap = doc.createElement('button');
  swap.type = 'button';
  swap.classList.add('dt-base64__swap');
  swap.setAttribute('aria-label', translate('tools.base64.swap'));
  swap.title = translate('tools.base64.swap');
  swap.innerHTML = '<span aria-hidden="true">⇄</span>';
  swap.addEventListener('click', () => {
    const computed = computeOutput(state);
    const nextMode: Mode = state.mode === 'encode' ? 'decode' : 'encode';
    sourceArea.value = computed;
    update({ mode: nextMode, input: computed });
  });
  workspace.appendChild(swap);

  // Result (read-only)
  const resultArea = textarea({
    value: '',
    ariaLabel: translate('tools.urlenc.result.aria'),
    rows: 10,
    readonly: true,
  });
  resultArea.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono');

  const resultFootInfo = doc.createElement('span');
  resultFootInfo.classList.add('dt-base64__lengths');

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
  resultFoot.append(resultFootInfo, copyHandle.el);
  resultPaneBody.appendChild(resultFoot);

  const resultPane = panel({
    num: 2,
    label: resultLabel(state.mode),
    body: resultPaneBody,
    className: 'dt-base64__pane',
  });
  const resultLabelEl = resultPane.querySelector<HTMLDivElement>('.dt-panel__label');
  workspace.appendChild(resultPane);

  root.appendChild(workspace);

  // ─── Explainer ─────────────────────────────────────────────────────────
  root.appendChild(buildExplainer(doc));

  // Initial paint
  setActiveTab(state.mode);
  applyVariantVisibility();
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

  function applyVariantVisibility(): void {
    // Variant switch only matters for encode (decoding always uses
    // decodeURIComponent semantics and tolerates the URI alphabet).
    variantWrap.style.display = state.mode === 'encode' ? '' : 'none';
  }

  function update(patch: Partial<State>): void {
    const prevMode = state.mode;
    state = { ...state, ...patch };
    if (state.mode !== prevMode) {
      setActiveTab(state.mode);
      applyVariantVisibility();
      sourceArea.placeholder = placeholderFor(state.mode);
      if (sourceLabelEl) sourceLabelEl.textContent = sourceLabel(state.mode);
      if (resultLabelEl) resultLabelEl.textContent = resultLabel(state.mode);
    }
    if (state.variant !== (variantInput.checked ? 'uri' : 'component')) {
      variantInput.checked = state.variant === 'uri';
    }
    if (state.plus !== plusInput.checked) {
      plusInput.checked = state.plus;
    }
    if (sourceArea.value !== state.input) {
      sourceArea.value = state.input;
    }
    refreshOutput();
    options.onStateChange?.(state);
  }

  function refreshOutput(): void {
    const value = computeOutput(state);
    resultArea.value = value;
    sourceLengths.textContent = translate('tools.base64.chars', { n: String(state.input.length) });
    if (state.mode === 'decode') {
      const found = countEscapes(state.input);
      resultFootInfo.textContent = translate('tools.urlenc.escapes.found', { n: String(found) });
    } else {
      resultFootInfo.textContent = translate('tools.base64.chars', { n: String(value.length) });
    }
  }
}

function computeOutput(state: State): string {
  if (state.input === '') return '';
  return state.mode === 'encode'
    ? encode(state.input, state.variant, state.plus)
    : decode(state.input, state.plus);
}

function sourceLabel(mode: Mode): string {
  return mode === 'encode'
    ? translate('tools.urlenc.label.text')
    : translate('tools.urlenc.label.encoded');
}

function resultLabel(mode: Mode): string {
  return mode === 'encode'
    ? translate('tools.urlenc.label.encoded')
    : translate('tools.urlenc.label.text');
}

function placeholderFor(mode: Mode): string {
  return mode === 'encode'
    ? translate('tools.urlenc.placeholder.encode')
    : translate('tools.urlenc.placeholder.decode');
}

/** Append a translated string with `inline-code` segments to a parent element. */
function appendInline(parent: HTMLElement, text: string): void {
  const parts = text.split('`');
  parts.forEach((part, i) => {
    if (part === '') return;
    if (i % 2 === 0) {
      parent.appendChild(document.createTextNode(part));
    } else {
      const code = document.createElement('code');
      code.textContent = part;
      parent.appendChild(code);
    }
  });
}

/** The explainer block — three <details> sections (component, uri, plus). */
function buildExplainer(doc: Document): HTMLElement {
  const section = doc.createElement('section');
  section.classList.add('dt-base64__explainer');

  const renderDetails = (titleKey: string, bodyKey: string): HTMLDetailsElement => {
    const d = doc.createElement('details');
    d.classList.add('dt-base64__deepdive');
    const sum = doc.createElement('summary');
    sum.classList.add('dt-base64__deepdive-summary');
    sum.textContent = translate(titleKey as never);
    d.appendChild(sum);
    const p = doc.createElement('p');
    p.classList.add('dt-base64__explainer-p');
    appendInline(p, translate(bodyKey as never));
    d.appendChild(p);
    return d;
  };

  section.appendChild(
    renderDetails(
      'tools.urlenc.explainer.component.heading',
      'tools.urlenc.explainer.component.body',
    ),
  );
  section.appendChild(
    renderDetails('tools.urlenc.explainer.uri.heading', 'tools.urlenc.explainer.uri.body'),
  );
  section.appendChild(
    renderDetails('tools.urlenc.explainer.plus.heading', 'tools.urlenc.explainer.plus.body'),
  );

  return section;
}
