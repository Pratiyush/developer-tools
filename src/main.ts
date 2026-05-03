import './style.css';
import { initI18n, onLocaleChange, translate } from './lib/i18n';
import { initTheme } from './lib/theme';
import { TOOLS } from './tools/index';
import { home } from './ui/home';
import { illustration } from './ui/illustrations';
import { layout, type LayoutHandle } from './ui/layout';

const REPO_URL = 'https://github.com/Pratiyush/developer-tools';
const REDIRECT_KEY = 'dt.deep-redirect';

const hostMaybe = document.querySelector<HTMLElement>('#app');
if (!hostMaybe) {
  throw new Error('Mount target #app not found');
}
const host: HTMLElement = hostMaybe;

initI18n();
const theme = initTheme();

/** Active tool's dispose handle; cleared on every route change. Declared
 *  before {@link buildLayout} so the function body can reference it without
 *  hitting a temporal-dead-zone ReferenceError on initial mount. */
let activeToolDispose: (() => void) | null = null;

let ui: LayoutHandle = buildLayout();

onLocaleChange(() => {
  // Tear down the previous layout (also disposes tool/topbar/sidebar).
  ui.dispose();
  ui = buildLayout();
  routeTo(readHash());
});

/** Rebuilds the entire layout with the current locale's translations.
 *  Used on first paint and again when the topbar language switcher fires —
 *  every component captures its translations at construction time, so a
 *  full re-mount is the simplest way to reflect a runtime locale change. */
function buildLayout(): LayoutHandle {
  if (activeToolDispose) {
    activeToolDispose();
    activeToolDispose = null;
  }
  return layout({
    host,
    initialTheme: theme,
    tools: TOOLS,
    repoUrl: REPO_URL,
    onSelectTool: (id) => {
      if (id) routeTo(id);
      else routeTo(null);
    },
  });
}

function routeTo(id: string | null): void {
  // Tear down any previously mounted tool first.
  if (activeToolDispose) {
    activeToolDispose();
    activeToolDispose = null;
  }

  const homeCrumb = translate('nav.home');
  if (id === null) {
    ui.setView(home(TOOLS), [homeCrumb]);
    ui.sidebar.setActive(null);
    return;
  }
  const tool = TOOLS.find((t) => t.id === id);
  if (!tool) {
    ui.setView(notFound(id), [homeCrumb, '404']);
    ui.sidebar.setActive(null);
    return;
  }

  // Real mount. Parse current URL state, render, and wire change events.
  // The registry stores tools with their state generic widened to `never`,
  // so we treat each tool as a self-contained renderer that owns its own
  // state shape. The render call passes the current URL-derived state back
  // to itself; the only contract the registry cares about is dispose().
  const search = new URLSearchParams(window.location.search);
  const hashParams = parseToolHash();
  const wrap = document.createElement('div');
  wrap.classList.add('dt-tool-host');

  // Each tool's render hook may also accept an optional onStateChange callback
  // we wire to URL writes. We coerce through unknown — the registry intentionally
  // erases per-tool state so the dispatcher doesn't need to know each shape.
  const initial = (
    tool as unknown as { parseParams: (s: URLSearchParams, h: URLSearchParams) => unknown }
  ).parseParams(search, hashParams);
  const renderFn = (
    tool as unknown as {
      render: (
        host: HTMLElement,
        state: unknown,
        opts?: { onStateChange?: (next: unknown) => void },
      ) => { dispose(): void };
    }
  ).render;
  const serialize = (
    tool as unknown as {
      serializeParams: (state: unknown) => { search: URLSearchParams; hash: URLSearchParams };
    }
  ).serializeParams;

  const handle = renderFn(wrap, initial, {
    onStateChange: (next) => {
      writeToolUrl(tool.id, serialize(next));
    },
  });
  activeToolDispose = (): void => {
    handle.dispose();
  };
  ui.setView(wrap, [homeCrumb, formatCategory(tool.category), tool.name]);
  ui.sidebar.setActive(tool.id);
}

/** The router uses `#/<slug>` for navigation; tool state-hash is stored as
 *  a separate `?...` after a second `?` appended to the slug. We strip the
 *  navigation prefix and reparse the rest. */
function parseToolHash(): URLSearchParams {
  const raw = window.location.hash;
  if (!raw.startsWith('#/')) return new URLSearchParams();
  const idx = raw.indexOf('?');
  if (idx === -1) return new URLSearchParams();
  return new URLSearchParams(raw.slice(idx + 1));
}

/** Writes `?<search>` and `#/<slug>?<hash>` back to the URL without
 *  triggering the hashchange listener. */
function writeToolUrl(
  slug: string,
  parts: { search: URLSearchParams; hash: URLSearchParams },
): void {
  const searchString = parts.search.toString();
  const hashString = parts.hash.toString();
  const newSearch = searchString ? `?${searchString}` : '';
  const newHash = hashString ? `#/${slug}?${hashString}` : `#/${slug}`;
  const target = `${window.location.pathname}${newSearch}${newHash}`;
  window.history.replaceState(null, '', target);
}

function notFound(badId: string): HTMLElement {
  const wrap = document.createElement('div');
  wrap.classList.add('dt-error');

  const art = illustration('lost', { size: 200 });
  art.classList.add('dt-error__art');

  const heading = document.createElement('h1');
  heading.classList.add('dt-error__title');
  heading.textContent = translate('error.404.title');

  const lede = document.createElement('p');
  lede.classList.add('dt-error__body');
  lede.textContent = translate('error.404.body', { id: badId });

  const link = document.createElement('a');
  link.classList.add('dt-error__back');
  link.href = '#/';
  link.textContent = translate('error.back.home');

  wrap.append(art, heading, lede, link);
  return wrap;
}

function formatCategory(slug: string): string {
  const parts = slug.split('-');
  if (parts.length < 2) return slug;
  const rest = parts.slice(1).join(' ');
  return rest.charAt(0).toUpperCase() + rest.slice(1);
}

function readHash(): string | null {
  const hash = window.location.hash;
  if (!hash.startsWith('#/')) return null;
  // Strip any tool-state query (`?...`) before extracting the slug.
  const slugAndQuery = hash.slice(2);
  const idx = slugAndQuery.indexOf('?');
  const slug = idx === -1 ? slugAndQuery : slugAndQuery.slice(0, idx);
  return slug.length === 0 ? null : slug;
}

/**
 * Recover the original deep-link if the user landed via 404.html → /. The
 * 404 page stashed the requested path in sessionStorage. We replay it here
 * by syncing the hash and letting the normal router take over.
 */
function consumeDeepRedirect(): void {
  try {
    const stash = sessionStorage.getItem(REDIRECT_KEY);
    if (!stash) return;
    sessionStorage.removeItem(REDIRECT_KEY);
    if (stash.includes('#/')) {
      const idx = stash.indexOf('#');
      window.history.replaceState(null, '', '/developer-tools/' + stash.slice(idx));
    }
  } catch {
    // sessionStorage may be unavailable — silently ignore.
  }
}

consumeDeepRedirect();
routeTo(readHash());
window.addEventListener('hashchange', () => {
  routeTo(readHash());
});
