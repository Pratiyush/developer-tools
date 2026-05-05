import { translate } from '../../../lib/i18n';
import { copyButton, type CopyButtonHandle } from '../../../ui/primitives/copy-button';
import { panel } from '../../../ui/primitives/panel';
import { pasteButton, type PasteButtonHandle } from '../../../ui/primitives/paste-button';
import { textarea } from '../../../ui/primitives/textarea';
import { countEntities, decode, encode } from './logic';
import { type Mode, type State } from './url-state';

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
  root.classList.add('dt-base64'); // Reuse the base64 layout shell

  // ─── Heading + intro ───────────────────────────────────────────────────
  const heading = doc.createElement('h1');
  heading.classList.add('dt-basicauth__heading');
  heading.textContent = translate('tools.entities.heading');
  root.appendChild(heading);

  const intro = doc.createElement('p');
  intro.classList.add('dt-basicauth__intro');
  appendInline(intro, translate('tools.entities.intro'));
  root.appendChild(intro);

  // ─── Top control bar: mode tabs + variant toggle (encode-only) ────────
  const controls = doc.createElement('div');
  controls.classList.add('dt-base64__controls');

  const tabs = doc.createElement('div');
  tabs.classList.add('dt-base64__segmented');
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', translate('tools.entities.mode.aria'));
  const encodeTab = makeTab('encode', translate('tools.entities.mode.encode'));
  const decodeTab = makeTab('decode', translate('tools.entities.mode.decode'));
  tabs.append(encodeTab, decodeTab);
  controls.appendChild(tabs);

  // Variant switch — visible in encode mode only.
  const variantWrap = doc.createElement('label');
  variantWrap.classList.add('dt-base64__switch');
  const variantInput = doc.createElement('input');
  variantInput.type = 'checkbox';
  variantInput.classList.add('dt-base64__switch-input');
  variantInput.checked = state.variant === 'extended';
  const variantVisual = doc.createElement('span');
  variantVisual.classList.add('dt-base64__switch-visual');
  variantVisual.setAttribute('aria-hidden', 'true');
  const variantText = doc.createElement('span');
  variantText.classList.add('dt-base64__switch-label');
  variantText.textContent = translate('tools.entities.variant.label');
  variantWrap.append(variantInput, variantVisual, variantText);
  controls.appendChild(variantWrap);

  variantInput.addEventListener('change', () => {
    update({ variant: variantInput.checked ? 'extended' : 'minimal' });
  });

  root.appendChild(controls);

  // ─── Two-pane workspace ───────────────────────────────────────────────
  const workspace = doc.createElement('div');
  workspace.classList.add('dt-base64__workspace');

  // Source (editable)
  const sourceArea = textarea({
    value: state.input,
    placeholder: placeholderFor(state.mode),
    ariaLabel: translate('tools.entities.source.aria'),
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
    ariaLabel: translate('tools.entities.result.aria'),
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
    // Variant switch only matters for encode; hide it in decode mode so the
    // user isn't tempted to flip an irrelevant control.
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
    if (state.variant !== (variantInput.checked ? 'extended' : 'minimal')) {
      variantInput.checked = state.variant === 'extended';
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
      const found = countEntities(state.input);
      resultFootInfo.textContent = translate('tools.entities.entities.found', { n: String(found) });
    } else {
      resultFootInfo.textContent = translate('tools.base64.chars', { n: String(value.length) });
    }
  }
}

function computeOutput(state: State): string {
  if (state.input === '') return '';
  return state.mode === 'encode' ? encode(state.input, state.variant) : decode(state.input);
}

function sourceLabel(mode: Mode): string {
  return mode === 'encode'
    ? translate('tools.entities.label.text')
    : translate('tools.entities.label.html');
}

function resultLabel(mode: Mode): string {
  return mode === 'encode'
    ? translate('tools.entities.label.html')
    : translate('tools.entities.label.text');
}

function placeholderFor(mode: Mode): string {
  return mode === 'encode'
    ? translate('tools.entities.placeholder.encode')
    : translate('tools.entities.placeholder.decode');
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

/** The explainer block — three <details> sections (minimal, extended, numeric). */
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
    renderDetails('tools.entities.explainer.minimal.heading', 'tools.entities.explainer.minimal.body'),
  );
  section.appendChild(
    renderDetails(
      'tools.entities.explainer.extended.heading',
      'tools.entities.explainer.extended.body',
    ),
  );
  section.appendChild(
    renderDetails(
      'tools.entities.explainer.numeric.heading',
      'tools.entities.explainer.numeric.body',
    ),
  );

  return section;
}
