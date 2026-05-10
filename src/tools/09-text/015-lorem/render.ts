import { translate } from '../../../lib/i18n';
import { button, copyButton, heroBlock, type CopyButtonHandle } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { textarea } from '../../../ui/primitives/textarea';
import { generateLorem } from './logic';
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
      eyebrowKey: 'tools.lorem.eyebrow',
      heroKey: 'tools.lorem.heading',
      ledeKey: 'tools.lorem.intro',
      doc,
    }),
  );

  let output = generateLorem(state.paragraphs, state.classic);

  const out = textarea({ value: output, ariaLabel: translate('tools.lorem.output.aria'), rows: 14, readonly: true });
  out.classList.add('dt-base64__textarea');

  const body = doc.createElement('div');
  body.classList.add('dt-base64__pane-body');

  // Paragraph slider
  const wrap = doc.createElement('label');
  wrap.classList.add('dt-uuid__field');
  const lab = doc.createElement('span');
  lab.classList.add('dt-uuid__field-label');
  const value = doc.createElement('span');
  value.classList.add('dt-uuid__field-value');
  value.textContent = String(state.paragraphs);
  lab.append(doc.createTextNode(`${translate('tools.lorem.paragraphs.label')} · `), value);
  const slider = doc.createElement('input');
  slider.type = 'range';
  slider.min = '1';
  slider.max = '20';
  slider.value = String(state.paragraphs);
  slider.addEventListener('input', () => {
    state = { ...state, paragraphs: Number(slider.value) };
    value.textContent = String(state.paragraphs);
    regenerate();
    options.onStateChange?.(state);
  });
  wrap.append(lab, slider);
  body.append(wrap, out);

  const regen = button({ label: translate('tools.lorem.regenerate'), variant: 'primary', onClick: () => regenerate() });
  regen.classList.add('dt-base64__copy');
  const copy: CopyButtonHandle = copyButton({ text: () => out.value, label: translate('tools.base64.copy') });
  copy.el.classList.add('dt-base64__copy');
  disposers.push(() => copy.dispose());
  const foot = doc.createElement('div');
  foot.classList.add('dt-base64__pane-foot');
  foot.append(regen, copy.el);
  body.appendChild(foot);

  root.appendChild(panel({ num: 1, label: translate('tools.lorem.output.label'), body, className: 'dt-base64__pane' }));
  host.appendChild(root);

  function regenerate(): void {
    output = generateLorem(state.paragraphs, state.classic);
    out.value = output;
  }

  return {
    dispose(): void {
      for (const fn of disposers) fn();
      if (root.parentNode === host) host.removeChild(root);
    },
  };
}

export { DEFAULT_STATE };
