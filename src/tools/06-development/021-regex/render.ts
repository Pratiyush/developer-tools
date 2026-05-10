import { translate } from '../../../lib/i18n';
import { heroBlock } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { input as inputPrim } from '../../../ui/primitives/input';
import { textarea } from '../../../ui/primitives/textarea';
import { testRegex } from './logic';
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
      eyebrowKey: 'tools.regex.eyebrow',
      heroKey: 'tools.regex.heading',
      ledeKey: 'tools.regex.intro',
      doc,
    }),
  );

  // Pattern + flags row
  const patternRow = doc.createElement('div');
  patternRow.classList.add('dt-regex__pattern');

  const slashL = doc.createElement('span');
  slashL.classList.add('dt-regex__slash');
  slashL.textContent = '/';

  const patternEl = inputPrim({
    type: 'text',
    value: state.pattern,
    placeholder: '\\b\\w+@\\w+\\.\\w+\\b',
    ariaLabel: translate('tools.regex.pattern.aria'),
    onInput: (v) => {
      state = { ...state, pattern: v };
      refresh();
      options.onStateChange?.(state);
    },
  });
  patternEl.classList.add('dt-regex__pattern-in');

  const slashR = doc.createElement('span');
  slashR.classList.add('dt-regex__slash');
  slashR.textContent = '/';

  const flagsEl = inputPrim({
    type: 'text',
    value: state.flags,
    placeholder: 'gi',
    ariaLabel: translate('tools.regex.flags.aria'),
    onInput: (v) => {
      state = { ...state, flags: v.replace(/[^gimsuy]/g, '') };
      refresh();
      options.onStateChange?.(state);
    },
  });
  flagsEl.classList.add('dt-regex__flags');

  patternRow.append(slashL, patternEl, slashR, flagsEl);

  const subject = textarea({
    value: state.subject,
    placeholder: translate('tools.regex.subject.placeholder'),
    ariaLabel: translate('tools.regex.subject.aria'),
    rows: 6,
    onInput: (v) => {
      state = { ...state, subject: v };
      refresh();
      options.onStateChange?.(state);
    },
  });
  subject.classList.add('dt-base64__textarea');

  const inBody = doc.createElement('div');
  inBody.classList.add('dt-base64__pane-body');
  inBody.append(patternRow, subject);
  root.appendChild(panel({ num: 1, label: translate('tools.regex.input.label'), body: inBody, className: 'dt-base64__pane' }));

  const summary = doc.createElement('div');
  summary.classList.add('dt-regex__summary');
  const highlighted = doc.createElement('pre');
  highlighted.classList.add('dt-regex__highlight');
  const matches = doc.createElement('div');
  matches.classList.add('dt-regex__matches');

  const outBody = doc.createElement('div');
  outBody.classList.add('dt-base64__pane-body');
  outBody.append(summary, highlighted, matches);
  const outPane = panel({
    num: 2,
    label: translate('tools.regex.output.label'),
    body: outBody,
    className: 'dt-base64__pane',
  });
  const outRightEl = outPane.querySelector<HTMLSpanElement>('.dt-panel__label');
  // Add a right-aligned hint slot we can update with the match count.
  const outRight = doc.createElement('span');
  outRight.classList.add('dt-panel__right');
  outRightEl?.appendChild(outRight);
  root.appendChild(outPane);

  host.appendChild(root);
  refresh();

  return {
    dispose(): void {
      if (root.parentNode === host) host.removeChild(root);
    },
  };

  function refresh(): void {
    matches.replaceChildren();
    highlighted.replaceChildren();
    if (!state.pattern) {
      summary.textContent = '';
      outRight.textContent = '';
      return;
    }
    const r = testRegex(state.pattern, state.flags, state.subject);
    if (!r.ok) {
      summary.textContent = r.error;
      summary.classList.add('dt-regex__summary--err');
      outRight.textContent = '';
      return;
    }
    summary.classList.remove('dt-regex__summary--err');
    summary.textContent = translate('tools.regex.match.count', { n: r.matches.length });
    outRight.textContent = `${r.matches.length} ${r.matches.length === 1 ? 'match' : 'matches'}`;

    // ─── Highlighted subject — wrap each match span in <mark> ────────────
    if (state.subject) {
      let cursor = 0;
      // Sort by index just in case; testRegex already returns them in order.
      const sorted = [...r.matches].sort((a, b) => a.index - b.index);
      for (const m of sorted) {
        if (m.index > cursor) {
          highlighted.appendChild(doc.createTextNode(state.subject.slice(cursor, m.index)));
        }
        const mark = doc.createElement('mark');
        mark.classList.add('dt-regex__mark');
        mark.textContent = m.match || '∅';
        if (!m.match) mark.classList.add('dt-regex__mark--empty');
        highlighted.appendChild(mark);
        cursor = m.index + m.match.length;
      }
      if (cursor < state.subject.length) {
        highlighted.appendChild(doc.createTextNode(state.subject.slice(cursor)));
      }
    }

    // ─── Per-match rows with positional + named groups ───────────────────
    for (const m of r.matches) {
      const row = doc.createElement('div');
      row.classList.add('dt-regex__match');
      const idx = doc.createElement('span');
      idx.classList.add('dt-regex__match-idx');
      idx.textContent = String(m.index);
      const val = doc.createElement('code');
      val.classList.add('dt-regex__match-val');
      val.textContent = m.match;
      row.append(idx, val);
      if (m.groups.length) {
        const groups = doc.createElement('span');
        groups.classList.add('dt-regex__match-groups');
        groups.textContent = m.groups.map((g, i) => `$${i + 1}=${g}`).join('  ');
        row.appendChild(groups);
      }
      const namedKeys = Object.keys(m.namedGroups);
      if (namedKeys.length) {
        const named = doc.createElement('span');
        named.classList.add('dt-regex__match-named');
        named.textContent = namedKeys
          .map((k) => `<${k}>=${m.namedGroups[k] ?? ''}`)
          .join('  ');
        row.appendChild(named);
      }
      matches.appendChild(row);
    }
  }
}

export { DEFAULT_STATE };
