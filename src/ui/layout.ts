import type { ToolMeta } from '../lib/types';
import type { Theme } from '../lib/theme';
import { footer } from './footer';
import { sidebar, type SidebarHandle } from './sidebar';
import { topbar, type TopbarHandle } from './topbar';

export interface LayoutHandle {
  topbar: TopbarHandle;
  sidebar: SidebarHandle;
  content: HTMLElement;
  setView(node: HTMLElement, crumb: readonly string[]): void;
  dispose(): void;
}

export interface LayoutOptions {
  host: HTMLElement;
  initialTheme: Theme;
  /** Tools that pass the visibility filter — what the sidebar/home shows. */
  tools: readonly ToolMeta[];
  /** Full registry, including hidden tools — used by the settings panel
   *  so the user can re-enable a tool they've previously hidden. */
  allTools?: readonly ToolMeta[];
  onSelectTool?: (id: string | null) => void;
  repoUrl?: string;
  /** Lookup for the currently-mounted tool. */
  getActiveToolId?: () => string | null;
}

export function layout(opts: LayoutOptions): LayoutHandle {
  opts.host.replaceChildren();
  opts.host.classList.add('dt-app');
  // Drawer state lives on the host as a data attribute so CSS can style
  // both the sidebar and a sibling backdrop without JS-side bookkeeping.
  opts.host.dataset.drawer = 'closed';

  // Backdrop sits visually between the sidebar (overlay) and the content.
  // Hidden on desktop via CSS; toggled visible with the drawer.
  const backdrop = document.createElement('div');
  backdrop.classList.add('dt-backdrop');
  backdrop.addEventListener('click', closeDrawer);

  const sb = sidebar({
    tools: opts.tools,
    onSelect: (id) => {
      // Selecting a tool from the drawer should close it on mobile.
      closeDrawer();
      opts.onSelectTool?.(id);
    },
  });

  // Close button inside the drawer for mobile users — invisible on desktop.
  const drawerClose = document.createElement('button');
  drawerClose.type = 'button';
  drawerClose.classList.add('dt-sidebar__close');
  drawerClose.setAttribute('aria-label', 'Close menu');
  drawerClose.innerHTML = '<span aria-hidden="true">×</span>';
  drawerClose.addEventListener('click', closeDrawer);
  sb.el.prepend(drawerClose);

  const main = document.createElement('div');
  main.classList.add('dt-app__main');

  // The settings panel needs the *full* registry (including hidden tools)
  // so the user can re-enable anything. Falls back to the visible list if
  // the host hasn't passed the broader registry.
  const registry = opts.allTools ?? opts.tools;
  const tb = topbar({
    initialTheme: opts.initialTheme,
    onMenuClick: openDrawer,
    tools: registry,
    ...(opts.repoUrl !== undefined ? { repoUrl: opts.repoUrl } : {}),
    ...(opts.getActiveToolId ? { getActiveToolId: opts.getActiveToolId } : {}),
  });

  const content = document.createElement('main');
  content.classList.add('dt-app__content');

  const ft = footer();
  main.append(tb.el, content, ft.el);
  opts.host.append(sb.el, backdrop, main);

  // Esc key closes the drawer.
  const onKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && opts.host.dataset.drawer === 'open') {
      closeDrawer();
    }
  };
  document.addEventListener('keydown', onKeydown);

  function openDrawer(): void {
    opts.host.dataset.drawer = 'open';
  }

  function closeDrawer(): void {
    opts.host.dataset.drawer = 'closed';
  }

  function setView(node: HTMLElement, crumb: readonly string[]): void {
    content.replaceChildren(node);
    tb.setCrumb(crumb);
  }

  return {
    topbar: tb,
    sidebar: sb,
    content,
    setView,
    dispose() {
      document.removeEventListener('keydown', onKeydown);
      tb.dispose();
      sb.dispose();
    },
  };
}
