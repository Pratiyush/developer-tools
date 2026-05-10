import { translate } from '../../../lib/i18n';
import { button, copyButton, heroBlock, type CopyButtonHandle } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { textarea } from '../../../ui/primitives/textarea';
import { HASH_ALGOS, KEY_SIZES, generateRsaKeyPair, type HashAlgo, type KeySize } from './logic';
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
      eyebrowKey: 'tools.rsa.eyebrow',
      heroKey: 'tools.rsa.heading',
      ledeKey: 'tools.rsa.intro',
      doc,
    }),
  );

  // Configuration panel
  const cfgBody = doc.createElement('div');
  cfgBody.classList.add('dt-uuid__cfg');

  const sizeWrap = makeSegRow(
    doc,
    translate('tools.rsa.size.label'),
    KEY_SIZES.map((s) => String(s)),
    String(state.size),
    (v) => {
      state = { ...state, size: Number(v) as KeySize };
      options.onStateChange?.(state);
    },
  );
  cfgBody.appendChild(sizeWrap);

  const hashWrap = makeSegRow(
    doc,
    translate('tools.rsa.hash.label'),
    HASH_ALGOS,
    state.hash,
    (v) => {
      state = { ...state, hash: v as HashAlgo };
      options.onStateChange?.(state);
    },
  );
  cfgBody.appendChild(hashWrap);

  const generateBtn = button({
    label: translate('tools.rsa.generate'),
    variant: 'primary',
    onClick: () => {
      void generate();
    },
  });
  cfgBody.appendChild(generateBtn);

  const status = doc.createElement('div');
  status.classList.add('dt-uuid__field-label');
  cfgBody.appendChild(status);

  root.appendChild(
    panel({
      label: translate('tools.rsa.config'),
      num: 1,
      body: cfgBody,
      className: 'dt-base64__pane',
    }),
  );

  // Output: public + private PEMs
  const pubArea = textarea({
    value: '',
    ariaLabel: translate('tools.rsa.public.aria'),
    rows: 7,
    readonly: true,
  });
  pubArea.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono');
  const pubBody = doc.createElement('div');
  pubBody.classList.add('dt-base64__pane-body');
  pubBody.appendChild(pubArea);
  const pubCopy: CopyButtonHandle = copyButton({
    text: () => pubArea.value,
    label: translate('tools.rsa.copy.public'),
  });
  pubCopy.el.classList.add('dt-base64__copy');
  disposers.push(() => pubCopy.dispose());
  const pubFoot = doc.createElement('div');
  pubFoot.classList.add('dt-base64__pane-foot');
  pubFoot.append(pubCopy.el);
  pubBody.appendChild(pubFoot);
  root.appendChild(
    panel({
      label: translate('tools.rsa.public.label'),
      num: 2,
      body: pubBody,
      className: 'dt-base64__pane',
    }),
  );

  const privArea = textarea({
    value: '',
    ariaLabel: translate('tools.rsa.private.aria'),
    rows: 14,
    readonly: true,
  });
  privArea.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono');
  const privBody = doc.createElement('div');
  privBody.classList.add('dt-base64__pane-body');
  privBody.appendChild(privArea);
  const privCopy: CopyButtonHandle = copyButton({
    text: () => privArea.value,
    label: translate('tools.rsa.copy.private'),
  });
  privCopy.el.classList.add('dt-base64__copy');
  disposers.push(() => privCopy.dispose());
  const privFoot = doc.createElement('div');
  privFoot.classList.add('dt-base64__pane-foot');
  privFoot.append(privCopy.el);
  privBody.appendChild(privFoot);
  const privWarn = doc.createElement('p');
  privWarn.classList.add('dt-jwt__warn');
  privWarn.textContent = translate('tools.rsa.private.warn');
  privBody.appendChild(privWarn);
  root.appendChild(
    panel({
      label: translate('tools.rsa.private.label'),
      num: 3,
      body: privBody,
      className: 'dt-base64__pane',
    }),
  );

  host.appendChild(root);

  return {
    dispose(): void {
      for (const fn of disposers) fn();
      if (root.parentNode === host) host.removeChild(root);
    },
  };

  async function generate(): Promise<void> {
    status.textContent = translate('tools.rsa.generating');
    generateBtn.disabled = true;
    try {
      const r = await generateRsaKeyPair(state.size, state.hash);
      pubArea.value = r.publicPem;
      privArea.value = r.privatePem;
      status.textContent = '';
    } catch (e) {
      status.textContent = e instanceof Error ? e.message : 'failed';
    } finally {
      generateBtn.disabled = false;
    }
  }
}

function makeSegRow(
  doc: Document,
  label: string,
  options: readonly string[],
  current: string,
  onChange: (v: string) => void,
): HTMLElement {
  const wrap = doc.createElement('div');
  wrap.classList.add('dt-uuid__field');
  const lbl = doc.createElement('span');
  lbl.classList.add('dt-uuid__field-label');
  lbl.textContent = label;
  const seg = doc.createElement('div');
  seg.classList.add('dt-base64__segmented');
  for (const o of options) {
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.classList.add('dt-base64__tab');
    if (o === current) btn.classList.add('dt-base64__tab--active');
    btn.textContent = o;
    btn.addEventListener('click', () => {
      for (const sib of seg.querySelectorAll('button')) sib.classList.remove('dt-base64__tab--active');
      btn.classList.add('dt-base64__tab--active');
      onChange(o);
    });
    seg.appendChild(btn);
  }
  wrap.append(lbl, seg);
  return wrap;
}

export { DEFAULT_STATE };
