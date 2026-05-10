import { translate } from '../../../lib/i18n';
import { button, copyButton, heroBlock, type CopyButtonHandle } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { textarea } from '../../../ui/primitives/textarea';
import { generateUlids } from './logic';
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
      eyebrowKey: 'tools.ulid.eyebrow',
      heroKey: 'tools.ulid.heading',
      ledeKey: 'tools.ulid.intro',
      doc,
    }),
  );

  let ulids = generateUlids(state.count);
  const out = textarea({
    value: ulids.join('\n'),
    ariaLabel: translate('tools.ulid.output.aria'),
    rows: 8,
    readonly: true,
  });
  out.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono');

  const body = doc.createElement('div');
  body.classList.add('dt-base64__pane-body');
  body.appendChild(out);

  // Count slider
  const countWrap = doc.createElement('label');
  countWrap.classList.add('dt-uuid__field');
  const countLabel = doc.createElement('span');
  countLabel.classList.add('dt-uuid__field-label');
  const countLabelValue = doc.createElement('span');
  countLabelValue.classList.add('dt-uuid__field-value');
  countLabelValue.textContent = String(state.count);
  countLabel.append(
    doc.createTextNode(`${translate('tools.ulid.count.label')} · `),
    countLabelValue,
  );
  const countInput = doc.createElement('input');
  countInput.type = 'range';
  countInput.min = '1';
  countInput.max = '100';
  countInput.value = String(state.count);
  countInput.addEventListener('input', () => {
    state = { ...state, count: Number(countInput.value) };
    countLabelValue.textContent = String(state.count);
    regenerate();
    options.onStateChange?.(state);
  });
  countWrap.append(countLabel, countInput);
  body.appendChild(countWrap);

  const regen = button({
    label: translate('tools.ulid.regenerate'),
    variant: 'primary',
    onClick: () => regenerate(),
  });
  regen.classList.add('dt-base64__copy');

  const copyHandle: CopyButtonHandle = copyButton({
    text: () => out.value,
    label: translate('tools.ulid.copy.all'),
  });
  copyHandle.el.classList.add('dt-base64__copy');
  disposers.push(() => copyHandle.dispose());

  const foot = doc.createElement('div');
  foot.classList.add('dt-base64__pane-foot');
  foot.append(regen, copyHandle.el);
  body.appendChild(foot);

  const pane = panel({
    num: 1,
    label: `${state.count} × ULID`,
    body,
    className: 'dt-base64__pane',
  });
  const labelEl = pane.querySelector<HTMLDivElement>('.dt-panel__label');
  root.appendChild(pane);

  host.appendChild(root);

  function regenerate(): void {
    ulids = generateUlids(state.count);
    out.value = ulids.join('\n');
    if (labelEl) labelEl.textContent = `${state.count} × ULID`;
  }

  return {
    dispose(): void {
      for (const fn of disposers) fn();
      if (root.parentNode === host) host.removeChild(root);
    },
  };
}

export { DEFAULT_STATE };
