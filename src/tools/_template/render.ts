import type { State } from './url-state';

export function render(host: HTMLElement, _initial: State): { dispose(): void } {
  const p = host.ownerDocument.createElement('p');
  p.textContent = 'Tool not yet implemented';
  host.appendChild(p);
  return {
    dispose(): void {
      if (p.parentNode === host) host.removeChild(p);
    },
  };
}
