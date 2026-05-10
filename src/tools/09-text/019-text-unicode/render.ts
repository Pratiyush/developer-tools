import { translate } from '../../../lib/i18n';
import { heroBlock } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { textarea } from '../../../ui/primitives/textarea';
import { inspect } from './logic';
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
      eyebrowKey: 'tools.unicode.eyebrow',
      heroKey: 'tools.unicode.heading',
      ledeKey: 'tools.unicode.intro',
      doc,
    }),
  );

  const input = textarea({
    value: state.input,
    placeholder: translate('tools.unicode.placeholder'),
    ariaLabel: translate('tools.unicode.input.aria'),
    rows: 2,
    onInput: (v) => {
      state = { ...state, input: v };
      refresh();
      options.onStateChange?.(state);
    },
  });
  input.classList.add('dt-base64__textarea');
  const inBody = doc.createElement('div');
  inBody.classList.add('dt-base64__pane-body');
  inBody.appendChild(input);
  root.appendChild(panel({ num: 1, label: translate('tools.unicode.input.label'), body: inBody, className: 'dt-base64__pane' }));

  const tableWrap = doc.createElement('div');
  tableWrap.classList.add('dt-unicode__table');

  const outBody = doc.createElement('div');
  outBody.classList.add('dt-base64__pane-body');
  outBody.appendChild(tableWrap);
  root.appendChild(panel({ num: 2, label: translate('tools.unicode.output.label'), body: outBody, className: 'dt-base64__pane' }));

  host.appendChild(root);
  refresh();

  return {
    dispose(): void {
      if (root.parentNode === host) host.removeChild(root);
    },
  };

  function refresh(): void {
    tableWrap.replaceChildren();
    const t = doc.createElement('table');
    const thead = doc.createElement('thead');
    const tr = doc.createElement('tr');
    for (const h of ['Char', 'U+', 'Decimal', 'UTF-8', 'UTF-16', 'Category']) {
      const th = doc.createElement('th');
      th.textContent = h;
      tr.appendChild(th);
    }
    thead.appendChild(tr);
    t.appendChild(thead);
    const tbody = doc.createElement('tbody');
    for (const row of inspect(state.input)) {
      const r = doc.createElement('tr');
      const cells = [row.char, row.hex, String(row.codepoint), row.utf8, row.utf16, row.category];
      for (const c of cells) {
        const td = doc.createElement('td');
        td.textContent = c;
        r.appendChild(td);
      }
      tbody.appendChild(r);
    }
    t.appendChild(tbody);
    tableWrap.appendChild(t);
  }
}

export { DEFAULT_STATE };
