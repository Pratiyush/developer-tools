import { icon } from './icon';

export interface PasteButtonOptions {
  onPaste: (text: string) => void;
  label?: string;
  pastedLabel?: string;
  /** ms to show the "pasted" state. Default 1500. */
  resetMs?: number;
  /** Called when the clipboard read throws (denied permission, http context). */
  onError?: (err: unknown) => void;
}

export interface PasteButtonHandle {
  el: HTMLButtonElement;
  dispose(): void;
}

/**
 * A small paste-from-clipboard button. Mirrors {@link copyButton}: shows a
 * "pasted" state for `resetMs` after a successful read, then reverts. Falls
 * back silently when the Clipboard API is unavailable so insecure contexts
 * don't break the UI; the optional `onError` lets the caller surface a hint.
 */
export function pasteButton(options: PasteButtonOptions): PasteButtonHandle {
  const el = document.createElement('button');
  el.type = 'button';
  el.classList.add('dt-paste');
  el.setAttribute('aria-label', options.label ?? 'Paste from clipboard');

  const iconSlot = document.createElement('span');
  iconSlot.classList.add('dt-paste__icon');
  iconSlot.appendChild(icon('paste', { size: 12 }));

  const labelSlot = document.createElement('span');
  labelSlot.textContent = options.label ?? 'Paste';

  el.appendChild(iconSlot);
  el.appendChild(labelSlot);

  let resetTimer: ReturnType<typeof setTimeout> | null = null;

  const handler = (): void => {
    void runPaste();
  };
  el.addEventListener('click', handler);

  async function runPaste(): Promise<void> {
    try {
      const value = await navigator.clipboard.readText();
      options.onPaste(value);
      showPasted();
    } catch (err) {
      options.onError?.(err);
    }
  }

  function showPasted(): void {
    el.classList.add('dt-paste--pasted');
    iconSlot.replaceChildren(icon('check', { size: 12 }));
    labelSlot.textContent = options.pastedLabel ?? 'Pasted';
    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      el.classList.remove('dt-paste--pasted');
      iconSlot.replaceChildren(icon('paste', { size: 12 }));
      labelSlot.textContent = options.label ?? 'Paste';
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
