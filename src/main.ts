import './style.css';
import { initI18n, translate } from './lib/i18n';
import { initTheme } from './lib/theme';
import { TOOLS } from './tools/index';
import { home } from './ui/home';
import { illustration } from './ui/illustrations';
import { layout } from './ui/layout';

const REPO_URL = 'https://github.com/Pratiyush/developer-tools';
const REDIRECT_KEY = 'dt.deep-redirect';

const host = document.querySelector<HTMLElement>('#app');
if (!host) {
  throw new Error('Mount target #app not found');
}

initI18n();
const theme = initTheme();

const ui = layout({
  host,
  initialTheme: theme,
  tools: TOOLS,
  repoUrl: REPO_URL,
  onSelectTool: (id) => {
    if (id) routeTo(id);
    else routeTo(null);
  },
});

function routeTo(id: string | null): void {
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
  const placeholder = document.createElement('div');
  placeholder.classList.add('dt-home__empty');
  placeholder.textContent = `${tool.name} — ${translate('tool.placeholder.body')}`;
  ui.setView(placeholder, [homeCrumb, formatCategory(tool.category), tool.name]);
  ui.sidebar.setActive(tool.id);
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
  const slug = hash.slice(2);
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
