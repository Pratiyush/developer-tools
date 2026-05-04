import { translate } from '../../../lib/i18n';
import { copyButton, type CopyButtonHandle } from '../../../ui/primitives/copy-button';
import { panel } from '../../../ui/primitives/panel';
import { pasteButton, type PasteButtonHandle } from '../../../ui/primitives/paste-button';
import { textarea } from '../../../ui/primitives/textarea';
import { decodeBasicAuth, encodeBasicAuth } from './logic';
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
  root.classList.add('dt-basicauth');

  // ─── Top bar: mode segmented (Build | Read) + intro ────────────────────
  const top = doc.createElement('div');
  top.classList.add('dt-basicauth__top');

  const tabs = doc.createElement('div');
  tabs.classList.add('dt-base64__segmented');
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', translate('tools.basicauth.mode.aria'));
  const buildTab = makeTab('encode', translate('tools.basicauth.mode.encode'));
  const readTab = makeTab('decode', translate('tools.basicauth.mode.decode'));
  tabs.append(buildTab, readTab);
  top.appendChild(tabs);

  // h1 placed above the intro so the tool view satisfies axe's
  // page-has-heading-one best-practice rule. Visually compact.
  const heading = doc.createElement('h1');
  heading.classList.add('dt-basicauth__heading');
  heading.textContent = translate('tools.basicauth.heading');
  top.appendChild(heading);

  const intro = doc.createElement('p');
  intro.classList.add('dt-basicauth__intro');
  intro.textContent = translate('tools.basicauth.intro');
  top.appendChild(intro);

  root.appendChild(top);

  // ─── Build pane (left) — username + password fields ────────────────────
  const buildBody = doc.createElement('div');
  buildBody.classList.add('dt-basicauth__form');

  const usernameRow = field({
    doc,
    label: translate('tools.basicauth.username.label'),
    inputId: 'dt-basicauth-username',
    children: () => {
      const inp = doc.createElement('input');
      inp.id = 'dt-basicauth-username';
      inp.type = 'text';
      inp.classList.add('dt-input');
      inp.value = state.username;
      inp.placeholder = translate('tools.basicauth.username.placeholder');
      inp.setAttribute('aria-label', translate('tools.basicauth.username.aria'));
      inp.autocomplete = 'username';
      inp.addEventListener('input', () => {
        update({ username: inp.value });
      });
      return { input: inp, suffix: copyButtonForField(() => inp.value, 'username') };
    },
  });

  const passwordRow = field({
    doc,
    label: translate('tools.basicauth.password.label'),
    inputId: 'dt-basicauth-password',
    children: () => {
      const inp = doc.createElement('input');
      inp.id = 'dt-basicauth-password';
      inp.type = 'password';
      inp.classList.add('dt-input');
      inp.value = state.password;
      inp.placeholder = translate('tools.basicauth.password.placeholder');
      inp.setAttribute('aria-label', translate('tools.basicauth.password.aria'));
      inp.autocomplete = 'current-password';
      inp.addEventListener('input', () => {
        update({ password: inp.value });
      });

      const reveal = doc.createElement('button');
      reveal.type = 'button';
      reveal.classList.add('dt-basicauth__reveal');
      reveal.textContent = translate('tools.basicauth.password.show');
      reveal.addEventListener('click', () => {
        const showing = inp.type === 'password';
        inp.type = showing ? 'text' : 'password';
        reveal.textContent = showing
          ? translate('tools.basicauth.password.hide')
          : translate('tools.basicauth.password.show');
      });

      const copy = copyButtonForField(() => inp.value, 'password');

      const suffix = doc.createElement('span');
      suffix.classList.add('dt-basicauth__suffixwrap');
      suffix.append(reveal, copy);
      return { input: inp, suffix };
    },
  });

  buildBody.append(usernameRow, passwordRow);
  const buildPane = panel({
    body: buildBody,
    className: 'dt-basicauth__pane',
  });

  // ─── Result pane (right) — Authorization header textarea + copy/paste ──
  const headerArea = textarea({
    value: '',
    placeholder: translate('tools.basicauth.header.placeholder'),
    ariaLabel: translate('tools.basicauth.header.aria'),
    rows: 4,
    onInput: (value) => {
      update({ header: value });
    },
  });
  headerArea.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono');

  const headerCopy: CopyButtonHandle = copyButton({
    text: () => headerArea.value,
    label: translate('tools.basicauth.copy.header'),
  });
  headerCopy.el.classList.add('dt-base64__copy');
  disposers.push(() => {
    headerCopy.dispose();
  });

  const headerPaste: PasteButtonHandle = pasteButton({
    label: translate('tools.basicauth.paste.header'),
    onPaste: (text) => {
      headerArea.value = text;
      update({ header: text });
    },
    onError: () => {
      const previous = headerArea.title;
      headerArea.title = translate('error.paste.failed');
      setTimeout(() => {
        headerArea.title = previous;
      }, 4000);
    },
  });
  headerPaste.el.classList.add('dt-base64__paste');
  disposers.push(() => {
    headerPaste.dispose();
  });

  const headerLabel = doc.createElement('label');
  headerLabel.classList.add('dt-basicauth__field-label');
  headerLabel.textContent = translate('tools.basicauth.header.label');
  headerLabel.htmlFor = 'dt-basicauth-header-area';
  headerArea.id = 'dt-basicauth-header-area';

  const headerFoot = doc.createElement('div');
  headerFoot.classList.add('dt-base64__pane-foot');
  const headerStatus = doc.createElement('span');
  headerStatus.classList.add('dt-basicauth__status');
  headerFoot.append(headerStatus);
  const footActions = doc.createElement('span');
  footActions.classList.add('dt-basicauth__foot-actions');
  footActions.append(headerPaste.el, headerCopy.el);
  headerFoot.appendChild(footActions);

  const headerBody = doc.createElement('div');
  headerBody.classList.add('dt-basicauth__header-body');
  headerBody.append(headerLabel, headerArea, headerFoot);

  const headerPane = panel({
    body: headerBody,
    className: 'dt-basicauth__pane',
  });

  // Workspace
  const workspace = doc.createElement('div');
  workspace.classList.add('dt-basicauth__workspace');
  workspace.append(buildPane, headerPane);
  root.appendChild(workspace);

  // Initial paint
  setActiveTab(state.mode);
  applyModeToDom(state.mode);
  refresh();

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
    for (const tab of [buildTab, readTab]) {
      const isActive = tab.dataset.mode === mode;
      tab.classList.toggle('dt-base64__tab--active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    }
  }

  function applyModeToDom(mode: Mode): void {
    // In Build mode the form is editable; in Read mode it shows decoded values
    // and the header is the active source. We toggle a class to flip ordering /
    // emphasis via CSS; the DOM stays the same.
    root.dataset.mode = mode;
  }

  function update(patch: Partial<State>): void {
    const prevMode = state.mode;
    state = { ...state, ...patch };
    if (state.mode !== prevMode) {
      setActiveTab(state.mode);
      applyModeToDom(state.mode);
    }
    refresh();
    options.onStateChange?.(state);
  }

  function refresh(): void {
    if (state.mode === 'encode') {
      const header = encodeBasicAuth({ username: state.username, password: state.password });
      // Only paint the header textarea when we actually have credentials —
      // an empty form should leave the header field blank, not show "Basic Og==".
      const computed = state.username === '' && state.password === '' ? '' : header;
      if (headerArea.value !== computed) {
        headerArea.value = computed;
      }
      headerStatus.textContent = '';
      headerStatus.classList.remove('dt-basicauth__status--err');
    } else {
      // Read mode — parse the header textarea, populate the inputs.
      const decoded = state.header === '' ? null : decodeBasicAuth(state.header);
      if (decoded) {
        const usernameInput = doc.getElementById('dt-basicauth-username') as HTMLInputElement | null;
        const passwordInput = doc.getElementById('dt-basicauth-password') as HTMLInputElement | null;
        if (usernameInput && usernameInput.value !== decoded.username) {
          usernameInput.value = decoded.username;
        }
        if (passwordInput && passwordInput.value !== decoded.password) {
          passwordInput.value = decoded.password;
        }
        headerStatus.textContent = '';
        headerStatus.classList.remove('dt-basicauth__status--err');
      } else if (state.header !== '') {
        headerStatus.textContent = translate('tools.basicauth.invalid');
        headerStatus.classList.add('dt-basicauth__status--err');
      } else {
        headerStatus.textContent = '';
        headerStatus.classList.remove('dt-basicauth__status--err');
      }
    }
  }

  function copyButtonForField(getText: () => string, kind: 'username' | 'password'): HTMLElement {
    const labelKey =
      kind === 'username' ? 'tools.basicauth.copy.username' : 'tools.basicauth.copy.password';
    const handle = copyButton({
      text: getText,
      label: translate(labelKey),
    });
    handle.el.classList.add('dt-basicauth__field-copy');
    disposers.push(() => {
      handle.dispose();
    });
    return handle.el;
  }
}

interface FieldOptions {
  doc: Document;
  label: string;
  inputId: string;
  children: () => { input: HTMLInputElement; suffix: HTMLElement };
}

function field(options: FieldOptions): HTMLElement {
  const wrap = options.doc.createElement('div');
  wrap.classList.add('dt-basicauth__field');

  const labelEl = options.doc.createElement('label');
  labelEl.classList.add('dt-basicauth__field-label');
  labelEl.htmlFor = options.inputId;
  labelEl.textContent = options.label;

  const row = options.doc.createElement('div');
  row.classList.add('dt-basicauth__field-row');
  const { input, suffix } = options.children();
  row.append(input, suffix);

  wrap.append(labelEl, row);
  return wrap;
}
