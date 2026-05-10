import { translate } from '../../../lib/i18n';
import { copyButton, heroBlock, type CopyButtonHandle } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { textarea } from '../../../ui/primitives/textarea';
import { decodeBase64, downloadBlobFromBase64, encodeFile } from './logic';
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
      eyebrowKey: 'tools.b64file.eyebrow',
      heroKey: 'tools.b64file.heading',
      ledeKey: 'tools.b64file.intro',
      doc,
    }),
  );

  // Mode tabs
  const tabs = doc.createElement('div');
  tabs.classList.add('dt-base64__segmented');
  for (const m of ['encode', 'decode'] as const) {
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.classList.add('dt-base64__tab');
    if (m === state.mode) btn.classList.add('dt-base64__tab--active');
    btn.textContent =
      m === 'encode' ? translate('tools.b64file.mode.encode') : translate('tools.b64file.mode.decode');
    btn.addEventListener('click', () => {
      state = { ...state, mode: m };
      for (const sib of tabs.querySelectorAll('button'))
        sib.classList.remove('dt-base64__tab--active');
      btn.classList.add('dt-base64__tab--active');
      refresh();
      options.onStateChange?.(state);
    });
    tabs.appendChild(btn);
  }

  // ─── Encode mode: file picker → base64/dataURI output ──────────────
  const encodeBody = doc.createElement('div');
  encodeBody.classList.add('dt-base64__pane-body');

  const dropZone = doc.createElement('label');
  dropZone.classList.add('dt-b64file__drop');
  dropZone.tabIndex = 0;

  const fileInput = doc.createElement('input');
  fileInput.type = 'file';
  fileInput.style.position = 'absolute';
  fileInput.style.opacity = '0';
  fileInput.style.pointerEvents = 'none';
  fileInput.addEventListener('change', () => {
    const f = fileInput.files?.[0];
    if (f) void handleFile(f);
  });
  dropZone.appendChild(fileInput);

  const dropMsg = doc.createElement('span');
  dropMsg.classList.add('dt-b64file__drop-msg');
  dropMsg.textContent = translate('tools.b64file.drop.label');
  dropZone.appendChild(dropMsg);

  // Drag + drop
  ['dragenter', 'dragover'].forEach((evt) => {
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropZone.classList.add('dt-b64file__drop--hover');
    });
  });
  ['dragleave', 'drop'].forEach((evt) => {
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropZone.classList.remove('dt-b64file__drop--hover');
    });
  });
  dropZone.addEventListener('drop', (e) => {
    const f = e.dataTransfer?.files?.[0];
    if (f) void handleFile(f);
  });
  encodeBody.appendChild(dropZone);

  const fileInfo = doc.createElement('div');
  fileInfo.classList.add('dt-uuid__field-label');
  fileInfo.style.color = 'var(--fg-muted)';
  encodeBody.appendChild(fileInfo);

  const encOut = textarea({
    value: '',
    ariaLabel: translate('tools.b64file.encoded.aria'),
    rows: 8,
    readonly: true,
  });
  encOut.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono');
  encodeBody.appendChild(encOut);

  const encCopy: CopyButtonHandle = copyButton({
    text: () => encOut.value,
    label: translate('tools.base64.copy'),
  });
  encCopy.el.classList.add('dt-base64__copy');
  disposers.push(() => encCopy.dispose());
  const encFoot = doc.createElement('div');
  encFoot.classList.add('dt-base64__pane-foot');
  encFoot.append(encCopy.el);
  encodeBody.appendChild(encFoot);

  // ─── Decode mode: base64 input → download blob ─────────────────────
  const decodeBody = doc.createElement('div');
  decodeBody.classList.add('dt-base64__pane-body');

  const decIn = textarea({
    value: '',
    placeholder: translate('tools.b64file.decode.placeholder'),
    ariaLabel: translate('tools.b64file.decode.aria'),
    rows: 8,
    onInput: () => decodeRefresh(),
  });
  decIn.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono');
  decodeBody.appendChild(decIn);

  const decInfo = doc.createElement('div');
  decInfo.classList.add('dt-uuid__field-label');
  decInfo.style.color = 'var(--fg-muted)';
  decodeBody.appendChild(decInfo);

  const downloadLink = doc.createElement('a');
  downloadLink.classList.add('dt-btn', 'dt-btn--primary');
  downloadLink.textContent = translate('tools.b64file.download');
  downloadLink.style.display = 'none';
  decodeBody.appendChild(downloadLink);

  // Wrap mode-specific bodies in panels.
  const tabsWrap = doc.createElement('div');
  tabsWrap.classList.add('dt-base64__pane-body');
  tabsWrap.appendChild(tabs);
  const headerPane = panel({
    label: translate('tools.b64file.input.label'),
    num: 1,
    body: tabsWrap,
    className: 'dt-base64__pane',
  });
  root.appendChild(headerPane);

  const workPane = panel({
    label: '',
    num: 2,
    body: encodeBody,
    className: 'dt-base64__pane',
  });
  root.appendChild(workPane);

  refresh();
  host.appendChild(root);

  return {
    dispose(): void {
      for (const fn of disposers) fn();
      if (downloadLink.href) URL.revokeObjectURL(downloadLink.href);
      if (root.parentNode === host) host.removeChild(root);
    },
  };

  function refresh(): void {
    if (state.mode === 'encode') {
      workPane.replaceChildren(...workPane.querySelectorAll('.dt-panel__label'), encodeBody);
    } else {
      workPane.replaceChildren(...workPane.querySelectorAll('.dt-panel__label'), decodeBody);
    }
  }

  async function handleFile(f: File): Promise<void> {
    const r = await encodeFile(f);
    encOut.value = r.base64;
    fileInfo.textContent = translate('tools.b64file.file.info', {
      name: r.filename,
      size: String(r.bytes),
      mime: r.mime,
    });
  }

  function decodeRefresh(): void {
    if (downloadLink.href) URL.revokeObjectURL(downloadLink.href);
    downloadLink.removeAttribute('href');
    downloadLink.style.display = 'none';
    decInfo.textContent = '';
    if (!decIn.value.trim()) return;
    const result = downloadBlobFromBase64(decIn.value);
    const decoded = decodeBase64(decIn.value);
    if (!result || !decoded) {
      decInfo.textContent = translate('tools.b64file.decode.invalid');
      return;
    }
    downloadLink.href = result.url;
    downloadLink.download = result.filename;
    downloadLink.style.display = 'inline-flex';
    decInfo.textContent = translate('tools.b64file.decoded.info', {
      size: String(result.size),
      mime: result.mime,
    });
  }
}

export { DEFAULT_STATE };
