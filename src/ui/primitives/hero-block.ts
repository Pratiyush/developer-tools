/**
 * Hero block — the editorial header used at the top of every tool page.
 *
 * Layout (top → bottom):
 *   1. Eyebrow: small mono accent line, e.g. "§ 03 · Encoding"
 *   2. Hero h1: serif-italic accent under editorial; sans-bold elsewhere.
 *      Translation strings can mark a single `*word*` segment to render as
 *      an italic accent (terracotta in editorial; theme accent otherwise).
 *   3. Lede: optional muted paragraph with `inline-code` segments.
 *
 * This is a pure DOM helper — it returns the assembled element, callers
 * append it where they want. No event listeners; no disposers needed.
 */

import { translate } from '../../lib/i18n';
import type { TranslationKey } from '../../locales/types';

export interface HeroBlockOptions {
  /** Translation key for the eyebrow line. Optional. */
  eyebrowKey?: TranslationKey;
  /** Optional substitutions for the eyebrow translation. */
  eyebrowParams?: Record<string, string | number>;
  /** Translation key for the hero h1. May contain a single `*word*` accent. */
  heroKey: TranslationKey;
  /** Translation key for the muted paragraph below the hero. Optional. */
  ledeKey?: TranslationKey;
  /** Document handle (for tools rendering into a non-default doc). */
  doc?: Document;
}

export function heroBlock(opts: HeroBlockOptions): HTMLElement {
  const doc = opts.doc ?? document;
  const head = doc.createElement('header');
  head.classList.add('dt-tool-page__head');

  if (opts.eyebrowKey) {
    const eb = doc.createElement('div');
    eb.classList.add('dt-eyebrow');
    eb.textContent = translate(opts.eyebrowKey, opts.eyebrowParams);
    head.appendChild(eb);
  }

  const h1 = doc.createElement('h1');
  h1.classList.add('dt-hero');
  appendHeroAccent(h1, translate(opts.heroKey));
  head.appendChild(h1);

  if (opts.ledeKey) {
    const p = doc.createElement('p');
    p.classList.add('dt-lede');
    appendInline(p, translate(opts.ledeKey));
    head.appendChild(p);
  }

  return head;
}

/** Append a hero string, treating one `*word*` segment as an italic <em>. */
function appendHeroAccent(parent: HTMLElement, text: string): void {
  const parts = text.split(/(\*[^*]+\*)/);
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('*') && part.endsWith('*')) {
      const em = parent.ownerDocument.createElement('em');
      em.textContent = part.slice(1, -1);
      parent.appendChild(em);
    } else {
      parent.appendChild(parent.ownerDocument.createTextNode(part));
    }
  }
}

/** Append a translated string with backtick-fenced `inline code` segments. */
function appendInline(parent: HTMLElement, text: string): void {
  const parts = text.split('`');
  parts.forEach((part, i) => {
    if (part === '') return;
    if (i % 2 === 0) {
      parent.appendChild(parent.ownerDocument.createTextNode(part));
    } else {
      const code = parent.ownerDocument.createElement('code');
      code.textContent = part;
      parent.appendChild(code);
    }
  });
}
