import { translate } from '../../../lib/i18n';
import { heroBlock } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { textarea } from '../../../ui/primitives/textarea';
import { countWords } from './logic';
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
      eyebrowKey: 'tools.wordcount.eyebrow',
      heroKey: 'tools.wordcount.heading',
      ledeKey: 'tools.wordcount.intro',
      doc,
    }),
  );

  const input = textarea({
    value: state.input,
    placeholder: translate('tools.wordcount.placeholder'),
    ariaLabel: translate('tools.wordcount.input.aria'),
    rows: 12,
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
  root.appendChild(panel({ num: 1, label: translate('tools.wordcount.input.label'), body: inBody, className: 'dt-base64__pane' }));

  // Stats grid
  const stats = doc.createElement('div');
  stats.classList.add('dt-wc__stats');
  const make = (k: string): HTMLElement => {
    const cell = doc.createElement('div');
    cell.classList.add('dt-wc__stat');
    const label = doc.createElement('div');
    label.classList.add('dt-wc__stat-label');
    label.textContent = translate(k as never);
    const val = doc.createElement('div');
    val.classList.add('dt-wc__stat-value');
    cell.append(label, val);
    stats.appendChild(cell);
    return val;
  };
  const cWords = make('tools.wordcount.label.words');
  const cChars = make('tools.wordcount.label.chars');
  const cCharsNS = make('tools.wordcount.label.chars.no.spaces');
  const cSent = make('tools.wordcount.label.sentences');
  const cPara = make('tools.wordcount.label.paragraphs');
  const cReading = make('tools.wordcount.label.reading');

  const outBody = doc.createElement('div');
  outBody.classList.add('dt-base64__pane-body');
  outBody.appendChild(stats);
  root.appendChild(panel({ num: 2, label: translate('tools.wordcount.output.label'), body: outBody, className: 'dt-base64__pane' }));

  host.appendChild(root);
  refresh();

  return {
    dispose(): void {
      if (root.parentNode === host) host.removeChild(root);
    },
  };

  function refresh(): void {
    const r = countWords(state.input);
    cWords.textContent = String(r.words);
    cChars.textContent = String(r.chars);
    cCharsNS.textContent = String(r.charsNoSpaces);
    cSent.textContent = String(r.sentences);
    cPara.textContent = String(r.paragraphs);
    cReading.textContent = `${r.readingMinutes} min`;
  }
}

export { DEFAULT_STATE };
