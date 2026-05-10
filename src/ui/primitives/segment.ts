/**
 * `.dt-segment` — segmented control. Keyboard nav: ArrowLeft / ArrowRight
 * cycles selection. Fires `dt-segment-change` CustomEvent on change.
 *
 * Markup:
 *   <div class="dt-segment" role="tablist" data-tone="primary">
 *     <button class="dt-segment__item" role="tab" data-state="active|inactive">…</button>
 *     …
 *   </div>
 */

import { variants } from '../_helpers/variants';

export type SegmentTone = 'primary' | 'secondary';

export interface SegmentOptions {
  readonly items: readonly string[];
  readonly selected?: number;
  readonly tone?: SegmentTone;
  readonly ariaLabel?: string;
  readonly onChange?: (index: number) => void;
}

export interface SegmentChangeDetail {
  readonly index: number;
  readonly value: string;
}

const segmentClass = variants({
  base: 'dt-segment',
  variants: {
    tone: {
      primary: '',
      secondary: 'dt-segment--secondary',
    },
  },
  defaultVariants: { tone: 'primary' },
});

export function segment(options: SegmentOptions): HTMLDivElement {
  const tone: SegmentTone = options.tone ?? 'primary';
  const root = document.createElement('div');
  root.className = segmentClass({ tone });
  root.setAttribute('role', 'tablist');
  root.dataset.tone = tone;
  if (options.ariaLabel !== undefined) root.setAttribute('aria-label', options.ariaLabel);

  let selectedIndex = clampIndex(options.selected ?? 0, options.items.length);

  const buttons: HTMLButtonElement[] = options.items.map((label, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'dt-segment__item';
    button.textContent = label;
    button.setAttribute('role', 'tab');
    button.dataset.value = label;
    applyState(button, index === selectedIndex);
    button.addEventListener('click', () => activate(index));
    button.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        activate((selectedIndex - 1 + options.items.length) % options.items.length);
        buttons[selectedIndex]?.focus();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        activate((selectedIndex + 1) % options.items.length);
        buttons[selectedIndex]?.focus();
      } else if (event.key === 'Home') {
        event.preventDefault();
        activate(0);
        buttons[selectedIndex]?.focus();
      } else if (event.key === 'End') {
        event.preventDefault();
        activate(options.items.length - 1);
        buttons[selectedIndex]?.focus();
      }
    });
    return button;
  });

  for (const button of buttons) root.appendChild(button);

  function activate(nextIndex: number): void {
    if (nextIndex === selectedIndex) return;
    selectedIndex = nextIndex;
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      if (button !== undefined) applyState(button, i === selectedIndex);
    }
    const value = options.items[selectedIndex] ?? '';
    options.onChange?.(selectedIndex);
    root.dispatchEvent(
      new CustomEvent<SegmentChangeDetail>('dt-segment-change', {
        bubbles: true,
        detail: { index: selectedIndex, value },
      }),
    );
  }

  return root;
}

function clampIndex(index: number, length: number): number {
  if (length === 0) return 0;
  if (index < 0) return 0;
  if (index >= length) return length - 1;
  return index;
}

function applyState(button: HTMLButtonElement, active: boolean): void {
  button.dataset.state = active ? 'active' : 'inactive';
  button.setAttribute('aria-selected', active ? 'true' : 'false');
  button.tabIndex = active ? 0 : -1;
}
