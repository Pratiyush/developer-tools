import { translate } from '../../lib/i18n';
import { THEMES, THEME_LABEL, getThemeNote, setTheme, type Theme } from '../../lib/theme';
import { button, dropdown, icon, type DropdownHandle, type DropdownOption } from '../primitives';

export interface ThemeSwitcherHandle {
  el: HTMLElement;
  dispose(): void;
}

export function themeSwitcher(initial: Theme): ThemeSwitcherHandle {
  let current = initial;

  const trigger = button({
    label: THEME_LABEL[current],
    variant: 'secondary',
    iconName: 'palette',
    ariaLabel: translate('topbar.theme.aria'),
  });
  trigger.classList.add('dt-theme-switcher');

  // Append a chevron after the label so the affordance is obvious.
  trigger.appendChild(icon('chevronDown', { size: 12 }));

  const labelSpan = trigger.querySelector('span');

  const options: DropdownOption<Theme>[] = THEMES.map((theme) => ({
    value: theme,
    label: THEME_LABEL[theme],
    note: getThemeNote(theme),
  }));

  let handle: DropdownHandle | null = null;
  const wrap = document.createElement('span');
  wrap.appendChild(trigger);

  // The dropdown helper replaces `trigger` with its own wrapper inside `wrap`.
  handle = dropdown<Theme>({
    trigger,
    options,
    value: current,
    onChange: (next) => {
      current = next;
      setTheme(next);
      if (labelSpan) labelSpan.textContent = THEME_LABEL[next];
    },
  });

  return {
    el: wrap,
    dispose() {
      handle?.dispose();
    },
  };
}
