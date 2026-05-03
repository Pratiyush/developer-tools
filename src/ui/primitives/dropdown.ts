import { icon } from './icon';

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
  note?: string;
}

export interface DropdownOptions<T extends string> {
  trigger: HTMLElement;
  options: readonly DropdownOption<T>[];
  value: T;
  onChange: (next: T) => void;
  align?: 'left' | 'right';
}

export interface DropdownHandle {
  dispose(): void;
}

/**
 * Lightweight `<select>`-like menu. Anchored to a trigger element.
 * Closes on outside click, Escape, or selection. Keyboard-navigable.
 */
export function dropdown<T extends string>(opts: DropdownOptions<T>): DropdownHandle {
  const wrapper = document.createElement('div');
  wrapper.classList.add('dt-dropdown');
  opts.trigger.replaceWith(wrapper);
  wrapper.appendChild(opts.trigger);
  opts.trigger.setAttribute('aria-haspopup', 'menu');
  opts.trigger.setAttribute('aria-expanded', 'false');

  let menu: HTMLElement | null = null;
  let currentValue = opts.value;

  const onTriggerClick = (event: MouseEvent): void => {
    event.stopPropagation();
    if (menu) close();
    else open();
  };
  opts.trigger.addEventListener('click', onTriggerClick);

  const onDocClick = (event: MouseEvent): void => {
    if (!menu) return;
    if (!wrapper.contains(event.target as Node)) close();
  };
  const onKey = (event: KeyboardEvent): void => {
    if (!menu) return;
    if (event.key === 'Escape') close();
  };

  function open(): void {
    menu = document.createElement('div');
    menu.classList.add('dt-dropdown__menu');
    menu.setAttribute('role', 'menu');
    if (opts.align === 'left') menu.style.right = 'auto';

    for (const option of opts.options) {
      const item = document.createElement('button');
      item.type = 'button';
      item.classList.add('dt-dropdown__item');
      item.setAttribute('role', 'menuitem');
      if (option.value === currentValue) item.classList.add('dt-dropdown__item--active');

      const labelWrap = document.createElement('span');
      labelWrap.textContent = option.label;
      item.appendChild(labelWrap);

      if (option.note) {
        const note = document.createElement('span');
        note.style.color = 'var(--fg-faint)';
        note.style.fontSize = 'var(--fs-xs)';
        note.style.marginLeft = '12px';
        note.textContent = option.note;
        item.appendChild(note);
      }

      if (option.value === currentValue) {
        item.appendChild(icon('check', { size: 12 }));
      }

      item.addEventListener('click', () => {
        currentValue = option.value;
        opts.onChange(option.value);
        close();
      });

      menu.appendChild(item);
    }

    wrapper.appendChild(menu);
    opts.trigger.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
  }

  function close(): void {
    if (!menu) return;
    menu.remove();
    menu = null;
    opts.trigger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', onDocClick);
    document.removeEventListener('keydown', onKey);
  }

  return {
    dispose() {
      close();
      opts.trigger.removeEventListener('click', onTriggerClick);
    },
  };
}
