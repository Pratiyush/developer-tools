import { translate } from '../../../lib/i18n';
import { button, copyButton, heroBlock, type CopyButtonHandle } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { textarea } from '../../../ui/primitives/textarea';
import {
  buildAlphabet,
  entropyBits,
  generatePassword,
  strengthFor,
  timeToCrack,
} from './logic';
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
      eyebrowKey: 'tools.password.eyebrow',
      heroKey: 'tools.password.heading',
      ledeKey: 'tools.password.intro',
      doc,
    }),
  );

  // Output area
  const out = textarea({
    value: '',
    ariaLabel: translate('tools.password.output.aria'),
    rows: 2,
    readonly: true,
  });
  out.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono');

  // Strength meter — bar + 3-chip readout (bits / strength / crack time).
  const meter = doc.createElement('div');
  meter.classList.add('dt-pwd__meter');
  const meterFill = doc.createElement('div');
  meterFill.classList.add('dt-pwd__meter-fill');
  meter.appendChild(meterFill);

  const meterRow = doc.createElement('div');
  meterRow.classList.add('dt-pwd__meter-row');
  const chipBits = doc.createElement('span');
  chipBits.classList.add('dt-pwd__chip', 'dt-pwd__chip--bits');
  const chipStrength = doc.createElement('span');
  chipStrength.classList.add('dt-pwd__chip', 'dt-pwd__chip--strength');
  const chipTime = doc.createElement('span');
  chipTime.classList.add('dt-pwd__chip', 'dt-pwd__chip--time');
  meterRow.append(chipBits, chipStrength, chipTime);

  // ─── Output panel ─────────────────────────────────────────────────────
  const outBody = doc.createElement('div');
  outBody.classList.add('dt-base64__pane-body');
  outBody.append(out, meter, meterRow);

  const regen = button({
    label: translate('tools.password.regenerate'),
    variant: 'primary',
    onClick: () => regenerate(),
  });
  regen.classList.add('dt-base64__copy');
  const copyHandle: CopyButtonHandle = copyButton({
    text: () => out.value,
    label: translate('tools.password.copy'),
  });
  copyHandle.el.classList.add('dt-base64__copy');
  disposers.push(() => copyHandle.dispose());
  const outFoot = doc.createElement('div');
  outFoot.classList.add('dt-base64__pane-foot');
  outFoot.append(regen, copyHandle.el);
  outBody.appendChild(outFoot);

  const outPane = panel({
    num: 2,
    label: translate('tools.password.output.label'),
    body: outBody,
    className: 'dt-base64__pane',
  });

  // ─── Config panel ─────────────────────────────────────────────────────
  const cfgBody = doc.createElement('div');
  cfgBody.classList.add('dt-uuid__cfg');

  // Length slider
  const lenWrap = doc.createElement('label');
  lenWrap.classList.add('dt-uuid__field');
  const lenLabel = doc.createElement('span');
  lenLabel.classList.add('dt-uuid__field-label');
  const lenLabelValue = doc.createElement('span');
  lenLabelValue.classList.add('dt-uuid__field-value');
  lenLabelValue.textContent = String(state.length);
  lenLabel.append(
    doc.createTextNode(`${translate('tools.password.length.label')} · `),
    lenLabelValue,
  );
  const lenInput = doc.createElement('input');
  lenInput.type = 'range';
  lenInput.min = '4';
  lenInput.max = '128';
  lenInput.value = String(state.length);
  lenInput.addEventListener('input', () => {
    update({ length: Number(lenInput.value) });
  });
  lenWrap.append(lenLabel, lenInput);
  cfgBody.appendChild(lenWrap);

  // Flag checkboxes
  cfgBody.appendChild(
    flagRow(doc, translate('tools.password.upper.label'), state.upper, (v) =>
      update({ upper: v }),
    ),
  );
  cfgBody.appendChild(
    flagRow(doc, translate('tools.password.lower.label'), state.lower, (v) =>
      update({ lower: v }),
    ),
  );
  cfgBody.appendChild(
    flagRow(doc, translate('tools.password.digits.label'), state.digits, (v) =>
      update({ digits: v }),
    ),
  );
  cfgBody.appendChild(
    flagRow(doc, translate('tools.password.symbols.label'), state.symbols, (v) =>
      update({ symbols: v }),
    ),
  );
  cfgBody.appendChild(
    flagRow(
      doc,
      translate('tools.password.ambiguous.label'),
      state.excludeAmbiguous,
      (v) => update({ excludeAmbiguous: v }),
    ),
  );

  const cfgPane = panel({
    num: 1,
    label: translate('tools.password.config.label'),
    body: cfgBody,
    className: 'dt-base64__pane',
  });

  const workspace = doc.createElement('div');
  workspace.classList.add('dt-uuid__workspace');
  workspace.append(cfgPane, outPane);
  root.appendChild(workspace);

  host.appendChild(root);
  regenerate();

  return {
    dispose(): void {
      for (const fn of disposers) fn();
      if (root.parentNode === host) host.removeChild(root);
    },
  };

  function update(patch: Partial<State>): void {
    state = { ...state, ...patch };
    lenLabelValue.textContent = String(state.length);
    regenerate();
    options.onStateChange?.(state);
  }

  function regenerate(): void {
    const alphabet = buildAlphabet({
      upper: state.upper,
      lower: state.lower,
      digits: state.digits,
      symbols: state.symbols,
      excludeAmbiguous: state.excludeAmbiguous,
    });
    out.value = alphabet ? generatePassword(state.length, alphabet) : '';
    const ent = entropyBits(state.length, alphabet);
    const strength = strengthFor(ent);
    const pct = Math.min(100, (ent / 128) * 100);
    meterFill.style.width = `${pct}%`;
    meterFill.dataset.strength = strength;
    chipBits.textContent = `${ent.toFixed(0)} bits`;
    chipStrength.textContent = strength;
    chipStrength.dataset.strength = strength;
    chipTime.textContent = timeToCrack(ent);
  }
}

function flagRow(
  doc: Document,
  label: string,
  initial: boolean,
  onChange: (v: boolean) => void,
): HTMLElement {
  const wrap = doc.createElement('label');
  wrap.classList.add('dt-uuid__field', 'dt-pwd__check');
  const cb = doc.createElement('input');
  cb.type = 'checkbox';
  cb.checked = initial;
  cb.addEventListener('change', () => onChange(cb.checked));
  const text = doc.createElement('span');
  text.classList.add('dt-uuid__field-label');
  text.textContent = label;
  wrap.append(cb, text);
  return wrap;
}

export { DEFAULT_STATE };
