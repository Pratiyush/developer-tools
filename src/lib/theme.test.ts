import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_THEME,
  STORAGE_KEY,
  THEMES,
  applyTheme,
  getStoredTheme,
  initTheme,
  isTheme,
  setStoredTheme,
  setTheme,
} from './theme';

describe('theme system', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
  });

  it('exposes the three locked theme names with editorial as default', () => {
    expect(THEMES).toEqual(['editorial', 'clean', 'vercel']);
    expect(DEFAULT_THEME).toBe('editorial');
  });

  it('isTheme narrows valid strings to the kept set', () => {
    expect(isTheme('editorial')).toBe(true);
    expect(isTheme('clean')).toBe(true);
    expect(isTheme('vercel')).toBe(true);
    // Removed in the 2026-05-07 prune — these no longer count as themes.
    expect(isTheme('mono')).toBe(false);
    expect(isTheme('grid')).toBe(false);
    expect(isTheme('linear')).toBe(false);
    expect(isTheme('paper')).toBe(false);
    expect(isTheme('swiss')).toBe(false);
    expect(isTheme('aurora')).toBe(false);
    expect(isTheme('matrix')).toBe(false);
    expect(isTheme('not-a-theme')).toBe(false);
    expect(isTheme('')).toBe(false);
  });

  it('applyTheme sets the data-theme attribute on the root', () => {
    applyTheme('vercel');
    expect(document.documentElement.getAttribute('data-theme')).toBe('vercel');
  });

  it('getStoredTheme returns DEFAULT_THEME when storage is empty', () => {
    expect(getStoredTheme()).toBe(DEFAULT_THEME);
  });

  it('getStoredTheme falls back when an invalid value is stored', () => {
    localStorage.setItem(STORAGE_KEY, 'fictional-theme');
    expect(getStoredTheme()).toBe(DEFAULT_THEME);
  });

  it('getStoredTheme falls back when a removed theme value is stored', () => {
    // A user who had `mono` stored from a prior version should now reset
    // to editorial — exercise both that case and the type-narrowing.
    localStorage.setItem(STORAGE_KEY, 'mono');
    expect(getStoredTheme()).toBe(DEFAULT_THEME);
    localStorage.setItem(STORAGE_KEY, 'aurora');
    expect(getStoredTheme()).toBe(DEFAULT_THEME);
  });

  it('setStoredTheme persists to localStorage', () => {
    setStoredTheme('clean');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('clean');
  });

  it('setTheme writes both DOM and storage atomically', () => {
    setTheme('vercel');
    expect(document.documentElement.getAttribute('data-theme')).toBe('vercel');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('vercel');
  });

  it('initTheme reads storage and applies', () => {
    localStorage.setItem(STORAGE_KEY, 'clean');
    const theme = initTheme();
    expect(theme).toBe('clean');
    expect(document.documentElement.getAttribute('data-theme')).toBe('clean');
  });

  it('initTheme defaults to editorial when nothing is stored', () => {
    const theme = initTheme();
    expect(theme).toBe('editorial');
    expect(document.documentElement.getAttribute('data-theme')).toBe('editorial');
  });
});
