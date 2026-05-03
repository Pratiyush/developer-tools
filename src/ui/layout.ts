import type { ToolModule } from '../lib/types';
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
  tools: readonly ToolModule<unknown>[];
  onSelectTool?: (id: string | null) => void;
  repoUrl?: string;
}

export function layout(opts: LayoutOptions): LayoutHandle {
  opts.host.replaceChildren();
  opts.host.classList.add('dt-app');

  const sb = sidebar({
    tools: opts.tools,
    onSelect: (id) => opts.onSelectTool?.(id),
  });

  const main = document.createElement('div');
  main.classList.add('dt-app__main');

  const tb = topbar(
    opts.repoUrl !== undefined
      ? { initialTheme: opts.initialTheme, repoUrl: opts.repoUrl }
      : { initialTheme: opts.initialTheme },
  );

  const content = document.createElement('main');
  content.classList.add('dt-app__content');

  const ft = footer();
  main.append(tb.el, content, ft.el);
  opts.host.append(sb.el, main);

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
      tb.dispose();
      sb.dispose();
    },
  };
}
