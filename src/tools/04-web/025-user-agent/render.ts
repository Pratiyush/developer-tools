import { translate } from '../../../lib/i18n';
import { heroBlock } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { textarea } from '../../../ui/primitives/textarea';
import { parseUserAgent } from './logic';
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

  const root = doc.createElement('div');
  root.classList.add('dt-tool-page');

  root.appendChild(
    heroBlock({
      eyebrowKey: 'tools.ua.eyebrow',
      heroKey: 'tools.ua.heading',
      ledeKey: 'tools.ua.intro',
      doc,
    }),
  );

  const input = textarea({
    value: state.input || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
    placeholder: translate('tools.ua.placeholder'),
    ariaLabel: translate('tools.ua.input.aria'),
    rows: 3,
    onInput: (v) => {
      state = { ...state, input: v };
      refresh();
      options.onStateChange?.(state);
    },
  });
  input.classList.add('dt-base64__textarea');
  state = { ...state, input: input.value };

  const inBody = doc.createElement('div');
  inBody.classList.add('dt-base64__pane-body');
  inBody.appendChild(input);
  root.appendChild(panel({ num: 1, label: translate('tools.ua.input.label'), body: inBody, className: 'dt-base64__pane' }));

  const list = doc.createElement('dl');
  list.classList.add('dt-jwt__claims');
  const outBody = doc.createElement('div');
  outBody.classList.add('dt-base64__pane-body');
  outBody.appendChild(list);
  root.appendChild(panel({ num: 2, label: translate('tools.ua.output.label'), body: outBody, className: 'dt-base64__pane' }));

  host.appendChild(root);
  refresh();

  return {
    dispose(): void {
      if (root.parentNode === host) host.removeChild(root);
    },
  };

  function refresh(): void {
    list.replaceChildren();
    const r = parseUserAgent(state.input);
    const rows: readonly (readonly [string, string])[] = [
      [translate('tools.ua.label.browser'), `${r.browser.name} ${r.browser.version}`.trim()],
      [translate('tools.ua.label.os'), `${r.os.name} ${r.os.version}`.trim()],
      [translate('tools.ua.label.device'), r.device.type],
    ];
    for (const [k, v] of rows) {
      const dt = doc.createElement('dt');
      dt.classList.add('dt-jwt__claim-key');
      dt.textContent = k;
      const dd = doc.createElement('dd');
      dd.classList.add('dt-jwt__claim-value');
      dd.textContent = v || '—';
      list.append(dt, dd);
    }
  }
}

export { DEFAULT_STATE };
