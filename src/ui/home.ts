import { translate } from '../lib/i18n';
import type { ToolMeta } from '../lib/types';

export function home(tools: readonly ToolMeta[]): HTMLElement {
  const root = document.createElement('div');
  root.classList.add('dt-home');

  const hero = document.createElement('section');
  hero.classList.add('dt-home__hero');

  // Editorial eyebrow above the hero headline. Text is the brand short form
  // + total tool count — mirrors the zip's "§ 01 · Crypto" pattern but at
  // the home level.
  const eyebrow = document.createElement('div');
  eyebrow.classList.add('dt-eyebrow');
  eyebrow.textContent = translate('home.eyebrow', { count: tools.length });
  hero.appendChild(eyebrow);

  // Hero headline. The translation is allowed to contain a single `*word*`
  // segment which becomes an italic accent (terracotta under editorial,
  // theme-accent under others). We DO NOT use innerHTML — the splitter
  // below builds nodes manually so untrusted translation strings can't
  // smuggle markup.
  const h1 = document.createElement('h1');
  appendHeroAccent(h1, translate('home.hero.title'));
  const lede = document.createElement('p');
  lede.textContent = translate('home.hero.subtitle');
  hero.append(h1, lede);
  root.appendChild(hero);

  if (tools.length === 0) {
    const empty = document.createElement('div');
    empty.classList.add('dt-home__empty');
    empty.textContent = translate('home.empty');
    root.appendChild(empty);
    return root;
  }

  // Group by category
  const groups = new Map<string, ToolMeta[]>();
  for (const tool of tools) {
    const list = groups.get(tool.category) ?? [];
    list.push(tool);
    groups.set(tool.category, list);
  }

  const sortedCategories = Array.from(groups.keys()).sort();
  for (const category of sortedCategories) {
    const sectionH = document.createElement('h2');
    sectionH.classList.add('dt-home__section-h');
    sectionH.textContent = formatCategory(category) + ` · ${groups.get(category)?.length ?? 0}`;
    root.appendChild(sectionH);

    const grid = document.createElement('div');
    grid.classList.add('dt-home__grid');
    const list = groups.get(category) ?? [];
    list.sort((a, b) => a.number - b.number);
    for (const tool of list) {
      const card = document.createElement('a');
      card.classList.add('dt-card');
      card.href = `#/${tool.id}`;

      const num = document.createElement('span');
      num.classList.add('dt-card__num');
      num.textContent = String(tool.number).padStart(3, '0');

      const title = document.createElement('h3');
      title.classList.add('dt-card__title');
      title.textContent = tool.name;

      const desc = document.createElement('p');
      desc.classList.add('dt-card__desc');
      desc.textContent = tool.description;

      card.append(num, title, desc);
      grid.appendChild(card);
    }
    root.appendChild(grid);
  }

  return root;
}

function formatCategory(slug: string): string {
  const parts = slug.split('-');
  if (parts.length < 2) return slug;
  const rest = parts.slice(1).join(' ');
  return rest.charAt(0).toUpperCase() + rest.slice(1);
}

/** Append a hero-headline string, treating one `*word*` segment as an
 *  italic-accent <em>. Produces text nodes for the rest so untrusted
 *  translation strings can't smuggle markup. */
function appendHeroAccent(parent: HTMLElement, text: string): void {
  const parts = text.split(/(\*[^*]+\*)/);
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('*') && part.endsWith('*')) {
      const em = document.createElement('em');
      em.textContent = part.slice(1, -1);
      parent.appendChild(em);
    } else {
      parent.appendChild(document.createTextNode(part));
    }
  }
}
