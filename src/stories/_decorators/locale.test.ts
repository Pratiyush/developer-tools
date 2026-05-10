import { afterEach, describe, expect, it, vi } from 'vitest';
import { applyLocale, localeDecorator } from './locale';

vi.mock('../../lib/i18n', () => ({
  setLocale: vi.fn(),
}));

const { setLocale: mockedSetLocale } = await import('../../lib/i18n');

afterEach(() => {
  vi.mocked(mockedSetLocale).mockClear();
});

describe('applyLocale', () => {
  it('sets lang + dir on the root for a known LTR locale', () => {
    const root = document.createElement('div');
    applyLocale({ locale: 'ja' }, root);
    expect(root.getAttribute('lang')).toBe('ja');
    expect(root.getAttribute('dir')).toBe('ltr');
  });

  it('sets dir=rtl for Arabic', () => {
    const root = document.createElement('div');
    applyLocale({ locale: 'ar' }, root);
    expect(root.getAttribute('lang')).toBe('ar');
    expect(root.getAttribute('dir')).toBe('rtl');
  });

  it('ignores unknown locale codes', () => {
    const root = document.createElement('div');
    applyLocale({ locale: 'xx' }, root);
    expect(root.hasAttribute('lang')).toBe(false);
    expect(root.hasAttribute('dir')).toBe(false);
  });

  it('skips when locale is missing', () => {
    const root = document.createElement('div');
    applyLocale({}, root);
    expect(root.hasAttribute('lang')).toBe(false);
  });

  it('calls setLocale on the in-app provider', () => {
    const root = document.createElement('div');
    applyLocale({ locale: 'de' }, root);
    expect(mockedSetLocale).toHaveBeenCalledWith('de', false);
  });
});

describe('localeDecorator', () => {
  it('applies the locale to documentElement and forwards to the story', () => {
    const seen: string[] = [];
    const story = (ctx: { globals: { locale?: string } }): null => {
      if (ctx.globals.locale !== undefined) seen.push(ctx.globals.locale);
      return null;
    };
    localeDecorator(story, { globals: { locale: 'fr' } });
    expect(document.documentElement.getAttribute('lang')).toBe('fr');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    expect(seen).toEqual(['fr']);
  });
});
