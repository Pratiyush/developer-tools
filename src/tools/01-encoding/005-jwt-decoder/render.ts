import { translate } from '../../../lib/i18n';
import { copyButton, type CopyButtonHandle } from '../../../ui/primitives/copy-button';
import { panel } from '../../../ui/primitives/panel';
import { pasteButton, type PasteButtonHandle } from '../../../ui/primitives/paste-button';
import { textarea } from '../../../ui/primitives/textarea';
import { input as inputPrim } from '../../../ui/primitives/input';
import {
  decodeJwt,
  formatTimestamp,
  isExpired,
  isNotYetValid,
  readTimestamp,
  verifyJwtHmac,
} from './logic';
import { type State } from './url-state';

export interface RenderOptions {
  onStateChange?: (next: State) => void;
}

/**
 * JWT decoder layout:
 *   1. Heading + intro (with the "never verifies" warning baked in)
 *   2. Input textarea — paste a token here
 *   3. Header panel (read-only, pretty JSON, copy button)
 *   4. Payload panel (read-only, pretty JSON, copy button)
 *   5. Signature panel (read-only, opaque base64url string)
 *   6. Claims summary — alg/kid/exp/iat/nbf/iss/aud/sub if present
 *   7. Explainer block (structure / algorithms / security)
 *
 * On invalid input we surface a single error message in place of the
 * decoded panels and keep the input field intact so the user can edit.
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
  root.classList.add('dt-base64');

  // ─── Heading + intro ───────────────────────────────────────────────────
  const heading = doc.createElement('h1');
  heading.classList.add('dt-basicauth__heading');
  heading.textContent = translate('tools.jwt.heading');
  root.appendChild(heading);

  const intro = doc.createElement('p');
  intro.classList.add('dt-basicauth__intro');
  appendInline(intro, translate('tools.jwt.intro'));
  root.appendChild(intro);

  // ─── Input — jwt.io-style colored overlay ──────────────────────────────
  // Wrapper holds the textarea (transparent text, visible caret) over a
  // <pre> mirror that paints `header.payload.signature` in three colors.
  // Both elements share identical typography/wrap/padding so the caret
  // lines up with the colored characters underneath.
  const inputWrap = doc.createElement('div');
  inputWrap.classList.add('dt-jwt__input-wrap');

  const overlay = doc.createElement('pre');
  overlay.classList.add('dt-jwt__input-overlay');
  overlay.setAttribute('aria-hidden', 'true');
  inputWrap.appendChild(overlay);

  const inputArea = textarea({
    value: state.input,
    placeholder: translate('tools.jwt.input.placeholder'),
    ariaLabel: translate('tools.jwt.input.aria'),
    rows: 4,
    onInput: (value) => {
      paintOverlay(value);
      update({ input: value });
    },
  });
  inputArea.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono', 'dt-jwt__input-textarea');
  inputArea.addEventListener('scroll', () => {
    overlay.scrollTop = inputArea.scrollTop;
    overlay.scrollLeft = inputArea.scrollLeft;
  });
  inputWrap.appendChild(inputArea);
  paintOverlay(state.input);

  function paintOverlay(value: string): void {
    overlay.replaceChildren();
    if (!value) return;
    const parts = value.split('.');
    const classes = ['dt-jwt__seg-head', 'dt-jwt__seg-payload', 'dt-jwt__seg-sig'];
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) {
        const dot = doc.createElement('span');
        dot.classList.add('dt-jwt__seg-dot');
        dot.textContent = '.';
        overlay.appendChild(dot);
      }
      const seg = doc.createElement('span');
      // First three parts get the canonical jwt.io colors; if the user
      // pastes garbage with extra dots we just keep the last class going.
      seg.classList.add(classes[Math.min(i, 2)] ?? 'dt-jwt__seg-sig');
      seg.textContent = parts[i] ?? '';
      overlay.appendChild(seg);
    }
    // Trailing newline so the overlay's height matches a textarea that
    // ends without a newline (browsers render the textarea's last empty
    // line implicitly).
    overlay.appendChild(doc.createTextNode('\n'));
  }

  const inputPaneBody = doc.createElement('div');
  inputPaneBody.classList.add('dt-base64__pane-body');
  inputPaneBody.appendChild(inputWrap);

  const pasteHandle: PasteButtonHandle = pasteButton({
    label: translate('tools.base64.paste'),
    pastedLabel: translate('tools.base64.pasted'),
    onPaste: (text) => {
      inputArea.value = text;
      paintOverlay(text);
      update({ input: text });
      inputArea.focus();
    },
    onError: () => {
      const previous = inputArea.title;
      inputArea.title = translate('error.paste.failed');
      setTimeout(() => {
        inputArea.title = previous;
      }, 4000);
    },
  });
  pasteHandle.el.classList.add('dt-base64__paste');
  pasteHandle.el.setAttribute('aria-label', translate('tools.base64.paste.aria'));
  disposers.push(() => {
    pasteHandle.dispose();
  });

  const inputFoot = doc.createElement('div');
  inputFoot.classList.add('dt-base64__pane-foot');
  inputFoot.appendChild(pasteHandle.el);
  inputPaneBody.appendChild(inputFoot);

  const inputPane = panel({
    num: 1,
    label: translate('tools.jwt.input.label'),
    body: inputPaneBody,
    className: 'dt-base64__pane',
  });
  root.appendChild(inputPane);

  // ─── Output container (header + payload + signature + claims) ────────
  const output = doc.createElement('div');
  output.classList.add('dt-jwt__output');
  root.appendChild(output);

  // ─── Explainer ─────────────────────────────────────────────────────────
  root.appendChild(buildExplainer(doc));

  // First paint
  refreshOutput();
  host.appendChild(root);

  return {
    dispose(): void {
      for (const fn of disposers) fn();
      if (root.parentNode === host) host.removeChild(root);
    },
  };

  // ─── helpers ───────────────────────────────────────────────────────────

  function update(patch: Partial<State>): void {
    state = { ...state, ...patch };
    if (inputArea.value !== state.input) {
      inputArea.value = state.input;
      paintOverlay(state.input);
    }
    refreshOutput();
    options.onStateChange?.(state);
  }

  function refreshOutput(): void {
    output.replaceChildren();
    if (!state.input.trim()) return;

    const result = decodeJwt(state.input);
    if (!result.ok) {
      const err = doc.createElement('p');
      err.classList.add('dt-jwt__error');
      err.setAttribute('role', 'alert');
      err.textContent = translate('tools.jwt.invalid');
      output.appendChild(err);
      return;
    }

    // Standing warning — the never-verified note is too important to put
    // inside a collapsible explainer. It appears above the decoded panels.
    const warn = doc.createElement('p');
    warn.classList.add('dt-jwt__warn');
    warn.textContent = translate('tools.jwt.warning.never.verified');
    output.appendChild(warn);

    if (result.header.alg === 'none') {
      const unsafe = doc.createElement('p');
      unsafe.classList.add('dt-jwt__warn', 'dt-jwt__warn--strong');
      unsafe.setAttribute('role', 'alert');
      unsafe.textContent = translate('tools.jwt.warning.unsigned');
      output.appendChild(unsafe);
    }

    output.appendChild(buildJsonPanel(translate('tools.jwt.header.label'), result.headerPretty));
    output.appendChild(buildJsonPanel(translate('tools.jwt.payload.label'), result.payloadPretty));
    output.appendChild(buildSigPanel(result.signature, state.input));
    output.appendChild(buildClaims(result.header, result.payload));
  }

  function buildJsonPanel(label: string, json: string): HTMLElement {
    const ta = textarea({
      value: json,
      ariaLabel: label,
      rows: Math.max(3, Math.min(12, json.split('\n').length + 1)),
      readonly: true,
    });
    ta.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono');

    const body = doc.createElement('div');
    body.classList.add('dt-base64__pane-body');
    body.appendChild(ta);

    const handle: CopyButtonHandle = copyButton({
      text: () => json,
      label: translate('tools.base64.copy'),
    });
    handle.el.classList.add('dt-base64__copy');
    disposers.push(() => {
      handle.dispose();
    });

    const foot = doc.createElement('div');
    foot.classList.add('dt-base64__pane-foot');
    foot.appendChild(handle.el);
    body.appendChild(foot);

    return panel({
      num: 2,
      label,
      body,
      className: 'dt-base64__pane',
    });
  }

  function buildSigPanel(signature: string, token: string): HTMLElement {
    const ta = textarea({
      value: signature,
      ariaLabel: translate('tools.jwt.signature.label'),
      rows: 2,
      readonly: true,
    });
    ta.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono');

    const body = doc.createElement('div');
    body.classList.add('dt-base64__pane-body');
    body.appendChild(ta);

    // ─── HS256/384/512 verifier — paste the secret, see the result ──────
    const verifyWrap = doc.createElement('div');
    verifyWrap.classList.add('dt-jwt__verify');

    const vlabel = doc.createElement('span');
    vlabel.classList.add('dt-uuid__field-label');
    vlabel.textContent = translate('tools.jwt.verify.label');
    verifyWrap.appendChild(vlabel);

    const status = doc.createElement('span');
    status.classList.add('dt-jwt__verify-status');
    status.textContent = translate('tools.jwt.verify.idle');

    // pendingId guards against stale completions when the user types
    // faster than HMAC resolves. `disposed` guards against a parent dispose
    // (route change) firing while a verify call is mid-flight — the .then
    // would otherwise write to a detached DOM node.
    let pendingId = 0;
    let disposed = false;
    disposers.push(() => {
      disposed = true;
    });
    const secretEl = inputPrim({
      type: 'password',
      value: '',
      placeholder: translate('tools.jwt.verify.placeholder'),
      ariaLabel: translate('tools.jwt.verify.aria'),
      onInput: (v) => {
        const myId = ++pendingId;
        if (!v) {
          status.dataset.status = 'idle';
          status.textContent = translate('tools.jwt.verify.idle');
          return;
        }
        status.dataset.status = 'pending';
        status.textContent = translate('tools.jwt.verify.checking');
        void verifyJwtHmac(token, v).then((r) => {
          if (disposed || myId !== pendingId) return;
          if (!r.ok) {
            status.dataset.status = 'unsupported';
            status.textContent =
              r.reason === 'unsupported'
                ? translate('tools.jwt.verify.unsupported')
                : translate('tools.jwt.verify.shape');
            return;
          }
          status.dataset.status = r.match ? 'match' : 'mismatch';
          status.textContent = r.match
            ? translate('tools.jwt.verify.match', { algo: r.algo })
            : translate('tools.jwt.verify.mismatch');
        });
      },
    });

    verifyWrap.append(secretEl, status);
    body.appendChild(verifyWrap);

    return panel({
      num: 3,
      label: translate('tools.jwt.signature.label'),
      body,
      className: 'dt-base64__pane',
    });
  }

  function buildClaims(
    header: Record<string, unknown>,
    payload: Record<string, unknown>,
  ): HTMLElement {
    const list = doc.createElement('dl');
    list.classList.add('dt-jwt__claims');

    const addRow = (label: string, value: string, status?: string): void => {
      const dt = doc.createElement('dt');
      dt.classList.add('dt-jwt__claim-key');
      dt.textContent = label;
      const dd = doc.createElement('dd');
      dd.classList.add('dt-jwt__claim-value');
      dd.textContent = value;
      if (status) {
        const tag = doc.createElement('span');
        tag.classList.add('dt-jwt__tag');
        tag.textContent = status;
        dd.appendChild(tag);
      }
      list.append(dt, dd);
    };

    if (typeof header.alg === 'string') addRow(translate('tools.jwt.alg.label'), header.alg);
    if (typeof header.kid === 'string') addRow(translate('tools.jwt.kid.label'), header.kid);

    const exp = readTimestamp(payload, 'exp');
    if (exp !== null) {
      addRow(
        translate('tools.jwt.exp.label'),
        formatTimestamp(exp),
        isExpired(payload) ? translate('tools.jwt.expired') : undefined,
      );
    }
    const iat = readTimestamp(payload, 'iat');
    if (iat !== null) addRow(translate('tools.jwt.iat.label'), formatTimestamp(iat));

    const nbf = readTimestamp(payload, 'nbf');
    if (nbf !== null) {
      addRow(
        translate('tools.jwt.nbf.label'),
        formatTimestamp(nbf),
        isNotYetValid(payload) ? translate('tools.jwt.notyet') : undefined,
      );
    }
    if (typeof payload.iss === 'string') addRow(translate('tools.jwt.iss.label'), payload.iss);
    if (typeof payload.aud === 'string') addRow(translate('tools.jwt.aud.label'), payload.aud);
    if (typeof payload.sub === 'string') addRow(translate('tools.jwt.sub.label'), payload.sub);

    return list;
  }
}

/** Append a translated string with `inline-code` segments to a parent element. */
function appendInline(parent: HTMLElement, text: string): void {
  // Support `**bold**` segments AND `inline code` in the same string by
  // running the bold pass first, then the code pass on each text node.
  const boldSplit = text.split(/(\*\*[^*]+\*\*)/);
  for (const seg of boldSplit) {
    if (!seg) continue;
    if (seg.startsWith('**') && seg.endsWith('**')) {
      const strong = document.createElement('strong');
      appendCodeSpans(strong, seg.slice(2, -2));
      parent.appendChild(strong);
    } else {
      appendCodeSpans(parent, seg);
    }
  }
}

function appendCodeSpans(parent: HTMLElement, text: string): void {
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

/** The explainer block — three <details> sections. */
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
      'tools.jwt.explainer.structure.heading',
      'tools.jwt.explainer.structure.body',
    ),
  );
  section.appendChild(
    renderDetails('tools.jwt.explainer.alg.heading', 'tools.jwt.explainer.alg.body'),
  );
  section.appendChild(
    renderDetails(
      'tools.jwt.explainer.security.heading',
      'tools.jwt.explainer.security.body',
    ),
  );

  return section;
}
