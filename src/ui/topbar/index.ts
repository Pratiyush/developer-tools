import { translate, getLocale } from '../../lib/i18n';
import type { Theme } from '../../lib/theme';
import type { ToolMeta } from '../../lib/types';
import { button } from '../primitives';
import { languageSwitcher } from './language-switcher';
import { settingsPanel } from './settings-panel';
import { themeSwitcher } from './theme-switcher';

export interface TopbarHandle {
  el: HTMLElement;
  setCrumb(items: readonly string[]): void;
  dispose(): void;
}

export interface TopbarOptions {
  initialTheme: Theme;
  initialCrumb?: readonly string[];
  repoUrl?: string;
  /** Fired when the hamburger menu button is clicked (mobile drawer open). */
  onMenuClick?: () => void;
  /** Full registry — passed through to the settings panel. */
  tools?: readonly ToolMeta[];
  /** Lookup for the currently-mounted tool, used by the recording-mode preset. */
  getActiveToolId?: () => string | null;
}

export function topbar(opts: TopbarOptions): TopbarHandle {
  const el = document.createElement('header');
  el.classList.add('dt-topbar');

  const left = document.createElement('div');
  left.classList.add('dt-topbar__left');

  // Hamburger — only visible on mobile via CSS. Wired to a layout-level
  // callback so the sidebar can be opened as a drawer.
  const menuBtn = button({
    iconName: 'menu',
    variant: 'icon',
    ariaLabel: translate('topbar.menu.aria'),
  });
  menuBtn.classList.add('dt-topbar__menu');
  if (opts.onMenuClick) {
    const handler = opts.onMenuClick;
    menuBtn.addEventListener('click', () => {
      handler();
    });
  }
  left.appendChild(menuBtn);

  const crumb = document.createElement('div');
  crumb.classList.add('dt-crumb');
  left.appendChild(crumb);

  const center = document.createElement('div');
  center.classList.add('dt-topbar__center');

  const right = document.createElement('div');
  right.classList.add('dt-topbar__right');

  // "Local · in your browser" pill — visible on viewports >720px. Reinforces
  // the project's core promise (nothing leaves the page) and matches the v3
  // mockup's right-aligned `.pill` chip with a green-dot status indicator.
  const localPill = document.createElement('span');
  localPill.classList.add('dt-pill--local');
  localPill.textContent = translate('topbar.local.label');
  right.appendChild(localPill);

  const langSwitcher = languageSwitcher(getLocale());
  right.appendChild(langSwitcher.el);

  const switcher = themeSwitcher(opts.initialTheme);
  right.appendChild(switcher.el);

  // Settings panel — only mounted when the host actually passes the
  // registry in. Lets us drop the topbar into demo / story contexts
  // without forcing a stub registry.
  const settings = opts.tools
    ? settingsPanel({
        tools: opts.tools,
        ...(opts.getActiveToolId ? { getActiveToolId: opts.getActiveToolId } : {}),
      })
    : null;
  if (settings) right.appendChild(settings.el);

  if (opts.repoUrl) {
    const ghLink = document.createElement('a');
    ghLink.href = opts.repoUrl;
    ghLink.target = '_blank';
    ghLink.rel = 'noreferrer noopener';
    ghLink.classList.add('dt-topbar__gh');
    const ghBtn = button({
      iconName: 'github',
      variant: 'icon',
      ariaLabel: translate('topbar.github.aria'),
    });
    ghLink.appendChild(ghBtn);
    right.appendChild(ghLink);
  }

  el.append(left, center, right);

  function setCrumb(items: readonly string[]): void {
    crumb.replaceChildren();
    items.forEach((item, i) => {
      if (i > 0) {
        const sep = document.createElement('span');
        sep.classList.add('dt-crumb__sep');
        sep.textContent = '/';
        crumb.appendChild(sep);
      }
      const span = document.createElement('span');
      if (i === items.length - 1) span.classList.add('dt-crumb__active');
      span.textContent = item;
      crumb.appendChild(span);
    });
  }

  setCrumb(opts.initialCrumb ?? ['Home']);

  return {
    el,
    setCrumb,
    dispose() {
      langSwitcher.dispose();
      switcher.dispose();
      settings?.dispose();
    },
  };
}
