/**
 * Storybook decorator that consumes the toolbar's `locale` global and:
 *   1. Calls `setLocale()` on the live app's i18n provider so stories that
 *      use `translate(key)` re-render with the chosen locale.
 *   2. Writes `<html lang="…">` for assistive tech.
 *   3. Writes `<html dir="rtl|ltr">` based on the locale's declared
 *      direction (only `ar` flips today; we still reset `ltr` on every
 *      non-RTL render so a previous RTL story can't bleed in).
 *
 * Like the theme decorator (SB-03 / #42), the inner `applyLocale`
 * function is exported separately so it can be unit-tested without
 * Storybook's runtime.
 */

import { getDir, isLocale, type LocaleCode } from '../../locales';
import { setLocale } from '../../lib/i18n';

interface LocaleGlobals {
  readonly locale?: string;
}

interface DecoratorContext {
  readonly globals: LocaleGlobals;
}

type StoryFn = (context: DecoratorContext) => unknown;

/**
 * Pure inner: apply the chosen locale to the provided root element +
 * the in-app provider. Skips when the locale is empty / unknown to
 * avoid clobbering the existing state during initial render.
 */
export function applyLocale(globals: LocaleGlobals, root: HTMLElement): void {
  const raw = globals.locale;
  if (typeof raw !== 'string' || raw.length === 0 || !isLocale(raw)) return;
  const locale: LocaleCode = raw;
  setLocale(locale, false);
  root.setAttribute('lang', locale);
  root.setAttribute('dir', getDir(locale));
}

export function localeDecorator(storyFn: StoryFn, context: DecoratorContext): unknown {
  if (typeof document !== 'undefined') {
    applyLocale(context.globals, document.documentElement);
  }
  return storyFn(context);
}
