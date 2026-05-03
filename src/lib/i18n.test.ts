import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCALE,
  STORAGE_KEY,
  detectBrowserLocale,
  getLocale,
  initI18n,
  setLocale,
  translate,
} from './i18n';

describe('i18n', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('lang');
    document.documentElement.removeAttribute('dir');
  });

  afterEach(() => {
    setLocale('en', false);
    localStorage.clear();
  });

  it('defaults to English', () => {
    expect(DEFAULT_LOCALE).toBe('en');
    initI18n();
    expect(translate('site.brand')).toBe('Developer Tools');
  });

  it('setLocale writes the html lang attribute', () => {
    setLocale('ja');
    expect(document.documentElement.getAttribute('lang')).toBe('ja');
    expect(getLocale()).toBe('ja');
  });

  it('Arabic flips the document dir to rtl', () => {
    setLocale('ar');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
  });

  it('persists the chosen locale', () => {
    setLocale('hi');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('hi');
  });

  it('translate replaces simple {param} placeholders', () => {
    const out = translate('home.hero.title');
    expect(out).toContain('100');
  });

  it('initI18n picks up a stored locale', () => {
    localStorage.setItem(STORAGE_KEY, 'fr');
    const locale = initI18n();
    expect(locale).toBe('fr');
  });

  it('detectBrowserLocale falls back to English when nothing matches', () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'languages');
    Object.defineProperty(navigator, 'languages', {
      value: ['xx-YY'],
      configurable: true,
    });
    expect(detectBrowserLocale()).toBe('en');
    if (original) Object.defineProperty(navigator, 'languages', original);
  });
});
