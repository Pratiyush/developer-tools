import { translate } from '../../../lib/i18n';
import { copyButton, heroBlock, type CopyButtonHandle } from '../../../ui/primitives';
import { panel } from '../../../ui/primitives/panel';
import { fromOctal, toOctal, toSymbolic, type ChmodPerms } from './logic';
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
  let perms: ChmodPerms = fromOctal(state.octal);
  const disposers: (() => void)[] = [];

  const root = doc.createElement('div');
  root.classList.add('dt-tool-page');

  root.appendChild(
    heroBlock({
      eyebrowKey: 'tools.chmod.eyebrow',
      heroKey: 'tools.chmod.heading',
      ledeKey: 'tools.chmod.intro',
      doc,
    }),
  );

  // Checkbox grid
  const grid = doc.createElement('table');
  grid.classList.add('dt-chmod__grid');
  const head = doc.createElement('tr');
  for (const h of [
    '',
    translate('tools.chmod.read'),
    translate('tools.chmod.write'),
    translate('tools.chmod.execute'),
  ]) {
    const th = doc.createElement('th');
    th.textContent = h;
    head.appendChild(th);
  }
  grid.appendChild(head);

  const checks: HTMLInputElement[] = [];
  for (const who of ['user', 'group', 'other'] as const) {
    const tr = doc.createElement('tr');
    const label = doc.createElement('th');
    label.textContent = translate(`tools.chmod.who.${who}` as never);
    tr.appendChild(label);
    for (const flag of ['r', 'w', 'x'] as const) {
      const td = doc.createElement('td');
      const cb = doc.createElement('input');
      cb.type = 'checkbox';
      cb.checked = perms[who][flag];
      cb.addEventListener('change', () => {
        perms = {
          ...perms,
          [who]: { ...perms[who], [flag]: cb.checked },
        };
        update();
      });
      td.appendChild(cb);
      tr.appendChild(td);
      checks.push(cb);
    }
    grid.appendChild(tr);
  }

  const cfgBody = doc.createElement('div');
  cfgBody.classList.add('dt-base64__pane-body');
  cfgBody.appendChild(grid);
  root.appendChild(panel({ num: 1, label: translate('tools.chmod.config'), body: cfgBody, className: 'dt-base64__pane' }));

  // Output
  const oct = doc.createElement('div');
  oct.classList.add('dt-chmod__big');
  const sym = doc.createElement('div');
  sym.classList.add('dt-chmod__sym');
  const cmd = doc.createElement('code');
  cmd.classList.add('dt-chmod__cmd');

  const outBody = doc.createElement('div');
  outBody.classList.add('dt-base64__pane-body');
  outBody.append(oct, sym, cmd);

  const copy: CopyButtonHandle = copyButton({
    text: () => oct.textContent ?? '',
    label: translate('tools.base64.copy'),
  });
  copy.el.classList.add('dt-base64__copy');
  disposers.push(() => copy.dispose());
  const foot = doc.createElement('div');
  foot.classList.add('dt-base64__pane-foot');
  foot.append(copy.el);
  outBody.appendChild(foot);

  root.appendChild(panel({ num: 2, label: translate('tools.chmod.output'), body: outBody, className: 'dt-base64__pane' }));

  host.appendChild(root);
  update();

  return {
    dispose(): void {
      for (const fn of disposers) fn();
      if (root.parentNode === host) host.removeChild(root);
    },
  };

  function update(): void {
    const o = toOctal(perms);
    state = { ...state, octal: o };
    oct.textContent = o;
    sym.textContent = toSymbolic(perms);
    cmd.textContent = `chmod ${o} file.txt`;
    options.onStateChange?.(state);
  }
}

export { DEFAULT_STATE };
