import { translate, getLocale } from '../../lib/i18n';
import type { Theme } from '../../lib/theme';
import { button, icon } from '../primitives';
import { languageSwitcher } from './language-switcher';
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
}

export function topbar(opts: TopbarOptions): TopbarHandle {
  const el = document.createElement('header');
  el.classList.add('dt-topbar');

  const left = document.createElement('div');
  left.classList.add('dt-topbar__left');
  const crumb = document.createElement('div');
  crumb.classList.add('dt-crumb');
  left.appendChild(crumb);

  const center = document.createElement('div');
  center.classList.add('dt-topbar__center');

  const right = document.createElement('div');
  right.classList.add('dt-topbar__right');

  const langSwitcher = languageSwitcher(getLocale());
  right.appendChild(langSwitcher.el);

  const switcher = themeSwitcher(opts.initialTheme);
  right.appendChild(switcher.el);

  if (opts.repoUrl) {
    const ghLink = document.createElement('a');
    ghLink.href = opts.repoUrl;
    ghLink.target = '_blank';
    ghLink.rel = 'noreferrer noopener';
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
  // Suppress unused-icon-import lint by exposing a helper for future use.
  void icon;

  return {
    el,
    setCrumb,
    dispose() {
      langSwitcher.dispose();
      switcher.dispose();
    },
  };
}
