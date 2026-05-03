import { icon } from './icon';

export interface CopyButtonOptions {
  text: () => string;
  label?: string;
  /** ms to show the "copied" state. Default 1500. */
  resetMs?: number;
}

export interface CopyButtonHandle {
  el: HTMLButtonElement;
  dispose(): void;
}

/**
 * A small copy-to-clipboard button. Shows a "copied" state for `resetMs`
 * after a successful copy, then reverts.
 */
export function copyButton(options: CopyButtonOptions): CopyButtonHandle {
  const el = document.createElement('button');
  el.type = 'button';
  el.classList.add('dt-copy');
  el.setAttribute('aria-label', options.label ?? 'Copy to clipboard');

  const iconSlot = document.createElement('span');
  iconSlot.classList.add('dt-copy__icon');
  iconSlot.appendChild(icon('copy', { size: 12 }));

  const labelSlot = document.createElement('span');
  labelSlot.textContent = options.label ?? 'Copy';

  el.appendChild(iconSlot);
  el.appendChild(labelSlot);

  let resetTimer: ReturnType<typeof setTimeout> | null = null;

  const handler = (): void => {
    void runCopy();
  };
  el.addEventListener('click', handler);

  async function runCopy(): Promise<void> {
    const value = options.text();
    try {
      await navigator.clipboard.writeText(value);
      showCopied();
    } catch {
      // Clipboard API can fail on insecure contexts or denied permissions.
      // No-op silently — UI just won't flash "copied".
    }
  }

  function showCopied(): void {
    el.classList.add('dt-copy--copied');
    iconSlot.replaceChildren(icon('check', { size: 12 }));
    labelSlot.textContent = 'Copied';
    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      el.classList.remove('dt-copy--copied');
      iconSlot.replaceChildren(icon('copy', { size: 12 }));
      labelSlot.textContent = options.label ?? 'Copy';
    }, options.resetMs ?? 1500);
  }

  return {
    el,
    dispose() {
      if (resetTimer) clearTimeout(resetTimer);
      el.removeEventListener('click', handler);
    },
  };
}
