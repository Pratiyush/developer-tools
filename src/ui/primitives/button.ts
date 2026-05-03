import type { IconName } from './icon';
import { icon } from './icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon';

export interface ButtonOptions {
  label?: string;
  variant?: ButtonVariant;
  iconName?: IconName;
  ariaLabel?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: MouseEvent) => void;
  disabled?: boolean;
}

export function button(options: ButtonOptions): HTMLButtonElement {
  const el = document.createElement('button');
  el.type = options.type ?? 'button';
  el.classList.add('dt-btn');
  const variant = options.variant ?? 'secondary';
  if (variant !== 'secondary') el.classList.add(`dt-btn--${variant}`);
  if (variant === 'icon' && !options.ariaLabel) {
    el.setAttribute('aria-label', options.label ?? 'button');
  }
  if (options.ariaLabel) el.setAttribute('aria-label', options.ariaLabel);
  if (options.disabled) el.disabled = true;

  if (options.iconName) {
    el.appendChild(icon(options.iconName, { size: variant === 'icon' ? 16 : 14 }));
  }
  if (options.label && variant !== 'icon') {
    const span = document.createElement('span');
    span.textContent = options.label;
    el.appendChild(span);
  }

  if (options.onClick) {
    el.addEventListener('click', options.onClick);
  }
  return el;
}
