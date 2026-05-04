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
  // name from the visible text. Setting aria-label here would override the
  // visible text for screen readers AND make Playwright's
  // getByLabel(/URL-safe variant/i) miss the checkbox.
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

/** Builds the explainer block — heading, summary prose, the "Cat" worked
 *  example, common-uses pointer, warning, plus four expandable deep-dive
 *  sections (encoding mechanic, alphabet, real-world uses, pitfalls). The
 *  numeric / table content stays in code (universal across locales);
 *  prose lines come from i18n. */
function buildExplainer(doc: Document): HTMLElement {
  const section = doc.createElement('section');
  section.classList.add('dt-base64__explainer');

  // h1 — page-level heading; satisfies axe page-has-heading-one too.
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

  // ─── Deep-dive expandables ─────────────────────────────────────────────
  // Use <details>/<summary> for native, accessible expand/collapse without
  // JS state. Each section opens to a longer technical explanation with
  // code blocks, padding rules, and pitfalls.
  section.appendChild(buildEncodingDeepDive(doc));
  section.appendChild(buildAlphabetDeepDive(doc));
  section.appendChild(buildUsesDeepDive(doc));
  section.appendChild(buildPitfallsDeepDive(doc));

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

function makeDetails(doc: Document, summaryText: string): HTMLDetailsElement {
  const details = doc.createElement('details');
  details.classList.add('dt-base64__deepdive');
  const summary = doc.createElement('summary');
  summary.classList.add('dt-base64__deepdive-summary');
  summary.textContent = summaryText;
  details.appendChild(summary);
  return details;
}

function makePre(doc: Document, lines: readonly string[], ariaLabel?: string): HTMLPreElement {
  const pre = doc.createElement('pre');
  pre.classList.add('dt-base64__explainer-eg');
  if (ariaLabel) pre.setAttribute('aria-label', ariaLabel);
  pre.textContent = lines.join('\n');
  return pre;
}

/** Step-by-step encoding deep-dive: full 24-bit chunk + the two padding cases. */
function buildEncodingDeepDive(doc: Document): HTMLDetailsElement {
  const details = makeDetails(doc, translate('tools.base64.deepdive.encoding.title'));
  details.appendChild(makeP(doc, translate('tools.base64.deepdive.encoding.intro')));

  // Full 3-byte chunk: "Man" → "TWFu" (no padding case).
  details.appendChild(
    makePre(
      doc,
      [
        'Encode "Man"  (3 bytes → 4 chars, no padding)',
        '',
        'ASCII   M         a         n',
        'hex     0x4D      0x61      0x6E',
        'bytes   01001101  01100001  01101110',
        'regroup 010011 010110 000101 101110',
        'index   19     22     5      46',
        'output  T      W      F      u',
      ],
      'Encoding "Man" to TWFu — three bytes producing four base64 characters',
    ),
  );

  // 2-byte case: "Ma" → "TWE=" (one pad).
  details.appendChild(
    makePre(
      doc,
      [
        'Encode "Ma"  (2 bytes → 3 chars + "=" pad)',
        '',
        'ASCII   M         a',
        'bytes   01001101  01100001',
        'regroup 010011 010110 000100',  // last group right-padded with zero bits
        'index   19     22     4      —',
        'output  T      W      E      =',
      ],
      'Encoding "Ma" to TWE= — two bytes plus one padding character',
    ),
  );

  // 1-byte case: "M" → "TQ==" (two pads).
  details.appendChild(
    makePre(
      doc,
      [
        'Encode "M"   (1 byte → 2 chars + "==" pad)',
        '',
        'ASCII   M',
        'bytes   01001101',
        'regroup 010011 010000',  // 4 trailing bits zero-padded
        'index   19     16     —      —',
        'output  T      Q      =      =',
      ],
      'Encoding "M" to TQ== — one byte plus two padding characters',
    ),
  );

  details.appendChild(
    makeP(
      doc,
      'Padding rule: the output length is always a multiple of 4. Each `=` says "the previous character carried zero-padded bits, ignore them on decode."',
    ),
  );

  return details;
}

/** Alphabet deep-dive: the 64 characters in order, plus the URL-safe diff. */
function buildAlphabetDeepDive(doc: Document): HTMLDetailsElement {
  const details = makeDetails(doc, translate('tools.base64.deepdive.alphabet.title'));
  details.appendChild(makeP(doc, translate('tools.base64.deepdive.alphabet.intro')));

  details.appendChild(
    makePre(
      doc,
      [
        'index  char    index  char    index  char    index  char',
        '----------------------------------------------------------',
        '  0    A         16   Q         32   g         48   w',
        '  1    B         17   R         33   h         49   x',
        '  2    C         18   S         34   i         50   y',
        '  3    D         19   T         35   j         51   z',
        '  4    E         20   U         36   k         52   0',
        '  5    F         21   V         37   l         53   1',
        '  6    G         22   W         38   m         54   2',
        '  7    H         23   X         39   n         55   3',
        '  8    I         24   Y         40   o         56   4',
        '  9    J         25   Z         41   p         57   5',
        ' 10    K         26   a         42   q         58   6',
        ' 11    L         27   b         43   r         59   7',
        ' 12    M         28   c         44   s         60   8',
        ' 13    N         29   d         45   t         61   9',
        ' 14    O         30   e         46   u         62   +    (URL-safe: -)',
        ' 15    P         31   f         47   v         63   /    (URL-safe: _)',
        '',
        '"=" is reserved for padding; URL-safe variant strips it.',
      ],
      'Base64 alphabet: 64 characters indexed 0-63 plus the URL-safe substitutions',
    ),
  );

  return details;
}

/** Common-uses deep-dive: HTTP, JWT, data URIs, MIME. */
function buildUsesDeepDive(doc: Document): HTMLDetailsElement {
  const details = makeDetails(doc, translate('tools.base64.deepdive.uses.title'));
  details.appendChild(makeP(doc, translate('tools.base64.deepdive.uses.intro')));

  details.appendChild(
    makePre(
      doc,
      [
        '# 1. HTTP Basic Auth (RFC 7617)',
        '   Authorization: Basic YWxhZGRpbjpvcGVuIHNlc2FtZQ==',
        '   decoded → "aladdin:open sesame"',
        '',
        '# 2. JWT segments (RFC 7519, base64url)',
        '   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.SflKxw...',
        '   header    .  payload                   .  signature',
        '',
        '# 3. data: URIs (RFC 2397)',
        '   <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAA...">',
        '',
        '# 4. Email MIME (RFC 2045 §6.8)',
        '   Content-Transfer-Encoding: base64',
        '   ...wraps lines at 76 characters...',
      ],
      'Common base64 use cases: HTTP Basic Auth, JWT, data URIs, MIME email',
    ),
  );

  return details;
}

/** Pitfalls deep-dive — the things that bite. */
function buildPitfallsDeepDive(doc: Document): HTMLDetailsElement {
  const details = makeDetails(doc, translate('tools.base64.deepdive.pitfalls.title'));
  details.appendChild(makeP(doc, translate('tools.base64.deepdive.pitfalls.intro')));

  const list = doc.createElement('ul');
  list.classList.add('dt-base64__deepdive-list');
  const items: readonly (readonly [string, string])[] = [
    [
      'Standard vs URL-safe',
      'Pick one and stick with it. Decoding URL-safe input with a strict standard decoder fails; the safe alphabet uses `-` and `_` instead of `+` and `/`, and usually omits `=` padding.',
    ],
    [
      'UTF-8 ≠ Latin-1',
      "`btoa('日本語')` throws — `btoa` only handles single-byte characters. Always encode through `TextEncoder` first so multibyte UTF-8 round-trips. This tool does that automatically.",
    ],
    [
      'Padding on decode',
      'Some decoders require `=` padding to a multiple of 4; some accept missing padding; some reject extra padding. When you control both ends, prefer URL-safe + no padding.',
    ],
    [
      'Line wrapping',
      'MIME wraps base64 at 76 characters with `\\r\\n`. JSON-embedded base64 generally does not. Strip whitespace before decoding if your decoder is strict.',
    ],
    [
      'Not encryption',
      "If you can read the string, you can read the data. Anyone capturing a `Basic` header can pull out the password. Use it for transport, not for secrecy.",
    ],
  ];

  for (const [term, body] of items) {
    const li = doc.createElement('li');
    const strong = doc.createElement('strong');
    strong.textContent = term;
    li.appendChild(strong);
    li.appendChild(doc.createTextNode(' — '));
    // Inline-code support inside the body text.
    const parts = body.split('`');
    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i];
      if (part === undefined) continue;
      if (i % 2 === 0) {
        li.appendChild(doc.createTextNode(part));
      } else {
        const code = doc.createElement('code');
        code.textContent = part;
        li.appendChild(code);
      }
    }
    list.appendChild(li);
  }
  details.appendChild(list);
  return details;
}
