import { translate } from '../../../lib/i18n';
import { copyButton, heroBlock, type CopyButtonHandle } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { textarea } from '../../../ui/primitives/textarea';
import { toNato } from './logic';
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
      eyebrowKey: 'tools.nato.eyebrow',
      heroKey: 'tools.nato.heading',
      ledeKey: 'tools.nato.intro',
      doc,
    }),
  );

  const input = textarea({
    value: state.input,
    placeholder: translate('tools.nato.placeholder'),
    ariaLabel: translate('tools.nato.input.aria'),
    rows: 3,
    onInput: (v) => {
      state = { ...state, input: v };
      out.value = toNato(state.input);
      options.onStateChange?.(state);
    },
  });
  input.classList.add('dt-base64__textarea');
  const inBody = doc.createElement('div');
  inBody.classList.add('dt-base64__pane-body');
  inBody.appendChild(input);
  root.appendChild(panel({ num: 1, label: translate('tools.nato.input.label'), body: inBody, className: 'dt-base64__pane' }));

  const out = textarea({ value: toNato(state.input), ariaLabel: translate('tools.nato.output.aria'), rows: 6, readonly: true });
  out.classList.add('dt-base64__textarea');
  const copy: CopyButtonHandle = copyButton({ text: () => out.value, label: translate('tools.base64.copy') });
  copy.el.classList.add('dt-base64__copy');
  disposers.push(() => copy.dispose());
  const outBody = doc.createElement('div');
  outBody.classList.add('dt-base64__pane-body');
  outBody.appendChild(out);
  const foot = doc.createElement('div');
  foot.classList.add('dt-base64__pane-foot');
  foot.append(copy.el);
  outBody.appendChild(foot);
  root.appendChild(panel({ num: 2, label: translate('tools.nato.output.label'), body: outBody, className: 'dt-base64__pane' }));

  host.appendChild(root);

  return {
    dispose(): void {
      for (const fn of disposers) fn();
      if (root.parentNode === host) host.removeChild(root);
    },
  };
}

export { DEFAULT_STATE };
