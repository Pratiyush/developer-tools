import { translate } from '../../../lib/i18n';
import { button, copyButton, heroBlock, type CopyButtonHandle } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { textarea } from '../../../ui/primitives/textarea';
import { formatUuid, generateUuids, parseUuidAnatomy } from './logic';
import { DEFAULT_STATE, type State } from './url-state';

export interface RenderOptions {
  onStateChange?: (next: State) => void;
}

/**
 * UUID generator render — single-pane: a config panel (count + format)
 * and an output panel (the generated UUIDs as a monospace block + copy).
 *
 * Note: UUIDs are NEVER persisted to the URL — they're high-entropy
 * identifiers that may end up linking to user-specific resources. The
 * URL state holds only display-prefs.
 */
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

  // Hero
  root.appendChild(
    heroBlock({
      eyebrowKey: 'tools.uuid.eyebrow',
      heroKey: 'tools.uuid.heading',
      ledeKey: 'tools.uuid.intro',
      doc,
    }),
  );

  // Output buffer — held outside the panel so we can refresh on demand.
  let uuids: readonly string[] = generateUuids(state.count).map((u) =>
    formatUuid(u, { case: state.case, format: state.format }),
  );

  // ─── Output panel ─────────────────────────────────────────────────────
  const outArea = textarea({
    value: uuids.join('\n'),
    ariaLabel: translate('tools.uuid.output.aria'),
    rows: 8,
    readonly: true,
  });
  outArea.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono');

  const outBody = doc.createElement('div');
  outBody.classList.add('dt-base64__pane-body');
  outBody.appendChild(outArea);

  const regenBtn = button({
    label: translate('tools.uuid.regenerate'),
    variant: 'primary',
    onClick: () => regenerate(),
  });
  regenBtn.classList.add('dt-base64__copy');

  const copyHandle: CopyButtonHandle = copyButton({
    text: () => outArea.value,
    label: translate('tools.uuid.copy.all'),
  });
  copyHandle.el.classList.add('dt-base64__copy');
  disposers.push(() => copyHandle.dispose());

  const outFoot = doc.createElement('div');
  outFoot.classList.add('dt-base64__pane-foot');
  outFoot.append(regenBtn, copyHandle.el);
  outBody.appendChild(outFoot);

  const outPane = panel({
    num: 2,
    label: translate('tools.uuid.output.label'),
    right: `${state.count} × UUID`,
    body: outBody,
    className: 'dt-base64__pane',
  });
  const outRightEl = outPane.querySelector<HTMLSpanElement>('.dt-panel__right');

  // ─── Config panel ─────────────────────────────────────────────────────
  const cfgBody = doc.createElement('div');
  cfgBody.classList.add('dt-uuid__cfg');

  // Count slider
  const countWrap = doc.createElement('label');
  countWrap.classList.add('dt-uuid__field');
  const countLabel = doc.createElement('span');
  countLabel.classList.add('dt-uuid__field-label');
  const countLabelText = `${translate('tools.uuid.count.label')} · `;
  const countLabelValue = doc.createElement('span');
  countLabelValue.classList.add('dt-uuid__field-value');
  countLabelValue.textContent = String(state.count);
  countLabel.append(doc.createTextNode(countLabelText), countLabelValue);
  const countInput = doc.createElement('input');
  countInput.type = 'range';
  countInput.min = '1';
  countInput.max = '100';
  countInput.value = String(state.count);
  countInput.addEventListener('input', () => {
    update({ count: Number(countInput.value) });
  });
  countWrap.append(countLabel, countInput);
  cfgBody.appendChild(countWrap);

  // Case + format radio groups (rendered as button rows)
  cfgBody.appendChild(
    radioRow({
      doc,
      label: translate('tools.uuid.case.label'),
      value: state.case,
      options: [
        { value: 'lower', label: translate('tools.uuid.case.lower') },
        { value: 'upper', label: translate('tools.uuid.case.upper') },
      ],
      onChange: (v) => update({ case: v as State['case'] }),
    }),
  );

  cfgBody.appendChild(
    radioRow({
      doc,
      label: translate('tools.uuid.format.label'),
      value: state.format,
      options: [
        { value: 'hyphen', label: translate('tools.uuid.format.hyphen') },
        { value: 'plain', label: translate('tools.uuid.format.plain') },
        { value: 'braces', label: translate('tools.uuid.format.braces') },
        { value: 'urn', label: translate('tools.uuid.format.urn') },
      ],
      onChange: (v) => update({ format: v as State['format'] }),
    }),
  );

  const cfgPane = panel({
    num: 1,
    label: translate('tools.uuid.config.label'),
    body: cfgBody,
    className: 'dt-base64__pane',
  });

  // ─── Anatomy panel — RFC 4122 §4.1 field breakdown of the first UUID ───
  const anatomyBody = doc.createElement('div');
  anatomyBody.classList.add('dt-uuid__anatomy');
  const anatomyRows: Record<string, HTMLElement> = {};
  const FIELDS: readonly { key: string; label: string }[] = [
    { key: 'timeLow', label: translate('tools.uuid.anatomy.timeLow') },
    { key: 'timeMid', label: translate('tools.uuid.anatomy.timeMid') },
    { key: 'timeHiAndVersion', label: translate('tools.uuid.anatomy.timeHi') },
    { key: 'clockSeqHiAndReserved', label: translate('tools.uuid.anatomy.clockHi') },
    { key: 'clockSeqLow', label: translate('tools.uuid.anatomy.clockLo') },
    { key: 'node', label: translate('tools.uuid.anatomy.node') },
    { key: 'version', label: translate('tools.uuid.anatomy.version') },
    { key: 'variant', label: translate('tools.uuid.anatomy.variant') },
  ];
  for (const f of FIELDS) {
    const row = doc.createElement('div');
    row.classList.add('dt-uuid__anatomy-row');
    const lbl = doc.createElement('span');
    lbl.classList.add('dt-uuid__anatomy-label');
    lbl.textContent = f.label;
    const val = doc.createElement('code');
    val.classList.add('dt-uuid__anatomy-value');
    val.textContent = '—';
    row.append(lbl, val);
    anatomyBody.appendChild(row);
    anatomyRows[f.key] = val;
  }
  const anatomyPane = panel({
    num: 3,
    label: translate('tools.uuid.anatomy.label'),
    right: 'RFC 4122 §4.1',
    body: anatomyBody,
    className: 'dt-base64__pane',
  });

  // Layout: config left, output right (single column on mobile via CSS)
  const workspace = doc.createElement('div');
  workspace.classList.add('dt-uuid__workspace');
  workspace.append(cfgPane, outPane);
  root.appendChild(workspace);
  root.appendChild(anatomyPane);

  refreshAnatomy();
  host.appendChild(root);

  return {
    dispose(): void {
      for (const fn of disposers) fn();
      if (root.parentNode === host) host.removeChild(root);
    },
  };

  function update(patch: Partial<State>): void {
    const prevCount = state.count;
    const prevCase = state.case;
    const prevFormat = state.format;
    state = { ...state, ...patch };
    countLabelValue.textContent = String(state.count);
    if (prevCount !== state.count) regenerate();
    else if (prevCase !== state.case || prevFormat !== state.format) reformat();
    options.onStateChange?.(state);
  }

  function regenerate(): void {
    uuids = generateUuids(state.count).map((u) =>
      formatUuid(u, { case: state.case, format: state.format }),
    );
    outArea.value = uuids.join('\n');
    if (outRightEl) outRightEl.textContent = `${state.count} × UUID`;
    refreshAnatomy();
  }

  function reformat(): void {
    uuids = uuids.map((u) => {
      // Strip any prior format wrapping back to a canonical lowercase
      // hyphenated form, then re-format.
      const stripped = u
        .replace(/^urn:uuid:/i, '')
        .replace(/^\{/, '')
        .replace(/\}$/, '')
        .toLowerCase();
      const canonical = stripped.includes('-')
        ? stripped
        : `${stripped.slice(0, 8)}-${stripped.slice(8, 12)}-${stripped.slice(12, 16)}-${stripped.slice(16, 20)}-${stripped.slice(20)}`;
      return formatUuid(canonical, { case: state.case, format: state.format });
    });
    outArea.value = uuids.join('\n');
  }

  function refreshAnatomy(): void {
    // Anatomy only makes sense on the canonical hyphenated form.
    const first = uuids[0] ?? '';
    const stripped = first
      .replace(/^urn:uuid:/i, '')
      .replace(/^\{/, '')
      .replace(/\}$/, '')
      .toLowerCase();
    const canonical = stripped.includes('-')
      ? stripped
      : `${stripped.slice(0, 8)}-${stripped.slice(8, 12)}-${stripped.slice(12, 16)}-${stripped.slice(16, 20)}-${stripped.slice(20)}`;
    const a = parseUuidAnatomy(canonical);
    if (!a) {
      for (const cell of Object.values(anatomyRows)) cell.textContent = '—';
      return;
    }
    anatomyRows.timeLow!.textContent = a.timeLow;
    anatomyRows.timeMid!.textContent = a.timeMid;
    anatomyRows.timeHiAndVersion!.textContent = a.timeHiAndVersion;
    anatomyRows.clockSeqHiAndReserved!.textContent = a.clockSeqHiAndReserved;
    anatomyRows.clockSeqLow!.textContent = a.clockSeqLow;
    anatomyRows.node!.textContent = a.node;
    anatomyRows.version!.textContent = `${a.version}`;
    anatomyRows.variant!.textContent = a.variant;
  }
}

/* ─── helpers ─────────────────────────────────────────────────────────── */

interface RadioRowOptions {
  doc: Document;
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (next: string) => void;
}

function radioRow(opts: RadioRowOptions): HTMLElement {
  const wrap = opts.doc.createElement('div');
  wrap.classList.add('dt-uuid__field');
  const label = opts.doc.createElement('span');
  label.classList.add('dt-uuid__field-label');
  label.textContent = opts.label;
  wrap.appendChild(label);

  const seg = opts.doc.createElement('div');
  seg.classList.add('dt-base64__segmented');
  seg.setAttribute('role', 'radiogroup');
  for (const o of opts.options) {
    const btn = opts.doc.createElement('button');
    btn.type = 'button';
    btn.classList.add('dt-base64__tab');
    btn.setAttribute('role', 'radio');
    if (o.value === opts.value) btn.classList.add('dt-base64__tab--active');
    btn.setAttribute('aria-checked', o.value === opts.value ? 'true' : 'false');
    btn.textContent = o.label;
    btn.addEventListener('click', () => {
      for (const sib of seg.querySelectorAll('button')) {
        sib.classList.remove('dt-base64__tab--active');
        sib.setAttribute('aria-checked', 'false');
      }
      btn.classList.add('dt-base64__tab--active');
      btn.setAttribute('aria-checked', 'true');
      opts.onChange(o.value);
    });
    seg.appendChild(btn);
  }
  wrap.appendChild(seg);
  return wrap;
}

export { DEFAULT_STATE };
