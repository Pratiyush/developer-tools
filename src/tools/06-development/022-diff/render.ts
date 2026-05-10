import { translate } from '../../../lib/i18n';
import { heroBlock } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { textarea } from '../../../ui/primitives/textarea';
import { diffLines, diffWords, statsFor } from './logic';
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
      eyebrowKey: 'tools.diff.eyebrow',
      heroKey: 'tools.diff.heading',
      ledeKey: 'tools.diff.intro',
      doc,
    }),
  );

  // Mode is purely a render-time concern; not persisted in URL state.
  let mode: 'line' | 'word' = 'line';

  // Two side-by-side textareas
  const grid = doc.createElement('div');
  grid.classList.add('dt-uuid__workspace');

  function pane(num: number, label: string, value: string, onInput: (v: string) => void): HTMLElement {
    const ta = textarea({
      value,
      placeholder: translate('tools.diff.placeholder'),
      ariaLabel: label,
      rows: 10,
      onInput,
    });
    ta.classList.add('dt-base64__textarea');
    const body = doc.createElement('div');
    body.classList.add('dt-base64__pane-body');
    body.appendChild(ta);
    return panel({ num, label, body, className: 'dt-base64__pane' });
  }

  grid.append(
    pane(1, translate('tools.diff.left.label'), state.a, (v) => {
      state = { ...state, a: v };
      refresh();
      options.onStateChange?.(state);
    }),
    pane(2, translate('tools.diff.right.label'), state.b, (v) => {
      state = { ...state, b: v };
      refresh();
      options.onStateChange?.(state);
    }),
  );
  root.appendChild(grid);

  // Mode toggle — line / word
  const modeRow = doc.createElement('div');
  modeRow.classList.add('dt-base64__segmented');
  modeRow.setAttribute('role', 'tablist');
  const modeBtns: Record<'line' | 'word', HTMLButtonElement> = {
    line: doc.createElement('button'),
    word: doc.createElement('button'),
  };
  for (const m of ['line', 'word'] as const) {
    const btn = modeBtns[m];
    btn.type = 'button';
    btn.classList.add('dt-base64__tab');
    if (m === mode) btn.classList.add('dt-base64__tab--active');
    btn.textContent =
      m === 'line' ? translate('tools.diff.mode.line') : translate('tools.diff.mode.word');
    btn.addEventListener('click', () => {
      mode = m;
      for (const sib of modeRow.querySelectorAll('button'))
        sib.classList.remove('dt-base64__tab--active');
      btn.classList.add('dt-base64__tab--active');
      refresh();
    });
    modeRow.appendChild(btn);
  }

  const summary = doc.createElement('div');
  summary.classList.add('dt-regex__summary');
  const list = doc.createElement('div');
  list.classList.add('dt-diff__lines');
  const inline = doc.createElement('p');
  inline.classList.add('dt-diff__inline');
  const outBody = doc.createElement('div');
  outBody.classList.add('dt-base64__pane-body');
  outBody.append(modeRow, summary, list, inline);
  const outPane = panel({ num: 3, label: translate('tools.diff.output.label'), body: outBody, className: 'dt-base64__pane' });
  const outLabelEl = outPane.querySelector<HTMLDivElement>('.dt-panel__label');
  const outRight = doc.createElement('span');
  outRight.classList.add('dt-panel__right');
  outLabelEl?.appendChild(outRight);
  root.appendChild(outPane);

  host.appendChild(root);
  refresh();

  return {
    dispose(): void {
      if (root.parentNode === host) host.removeChild(root);
    },
  };

  function refresh(): void {
    list.replaceChildren();
    inline.replaceChildren();
    if (!state.a && !state.b) {
      summary.textContent = '';
      outRight.textContent = '';
      return;
    }
    if (mode === 'line') {
      list.style.display = '';
      inline.style.display = 'none';
      const rows = diffLines(state.a, state.b);
      const s = statsFor(rows);
      summary.textContent = translate('tools.diff.stats', {
        added: s.added,
        removed: s.removed,
        unchanged: s.unchanged,
      });
      outRight.textContent = `+${s.added} −${s.removed}`;
      for (const r of rows) {
        const row = doc.createElement('div');
        row.classList.add('dt-diff__line', `dt-diff__line--${r.op}`);
        const sigil = doc.createElement('span');
        sigil.classList.add('dt-diff__sigil');
        sigil.textContent = r.op === 'eq' ? ' ' : r.op === 'add' ? '+' : '-';
        const code = doc.createElement('code');
        code.textContent = r.text;
        row.append(sigil, code);
        list.appendChild(row);
      }
    } else {
      list.style.display = 'none';
      inline.style.display = '';
      const rows = diffWords(state.a, state.b);
      const s = statsFor(rows);
      summary.textContent = translate('tools.diff.stats', {
        added: s.added,
        removed: s.removed,
        unchanged: s.unchanged,
      });
      outRight.textContent = `+${s.added} −${s.removed}`;
      for (const r of rows) {
        if (r.op === 'eq') {
          inline.appendChild(doc.createTextNode(r.text));
        } else {
          const seg = doc.createElement('span');
          seg.classList.add(r.op === 'add' ? 'dt-diff__add' : 'dt-diff__del');
          seg.textContent = r.text;
          inline.appendChild(seg);
        }
      }
    }
  }
}

export { DEFAULT_STATE };
