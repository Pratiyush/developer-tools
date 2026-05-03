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

  it('exposes the seven locked theme names', () => {
    expect(THEMES).toEqual(['clean', 'linear', 'vercel', 'paper', 'swiss', 'aurora', 'matrix']);
    expect(DEFAULT_THEME).toBe('clean');
  });

  it('isTheme narrows valid strings', () => {
    expect(isTheme('clean')).toBe(true);
    expect(isTheme('linear')).toBe(true);
    expect(isTheme('not-a-theme')).toBe(false);
    expect(isTheme('')).toBe(false);
  });

  it('applyTheme sets the data-theme attribute on the root', () => {
    applyTheme('aurora');
    expect(document.documentElement.getAttribute('data-theme')).toBe('aurora');
  });

  it('getStoredTheme returns DEFAULT_THEME when storage is empty', () => {
    expect(getStoredTheme()).toBe(DEFAULT_THEME);
  });

  it('getStoredTheme falls back when an invalid value is stored', () => {
    localStorage.setItem(STORAGE_KEY, 'fictional-theme');
    expect(getStoredTheme()).toBe(DEFAULT_THEME);
  });

  it('setStoredTheme persists to localStorage', () => {
    setStoredTheme('matrix');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('matrix');
  });

  it('setTheme writes both DOM and storage atomically', () => {
    setTheme('paper');
    expect(document.documentElement.getAttribute('data-theme')).toBe('paper');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('paper');
  });

  it('initTheme reads storage and applies', () => {
    localStorage.setItem(STORAGE_KEY, 'swiss');
    const theme = initTheme();
    expect(theme).toBe('swiss');
    expect(document.documentElement.getAttribute('data-theme')).toBe('swiss');
  });

  it('initTheme defaults to clean when nothing is stored', () => {
    const theme = initTheme();
    expect(theme).toBe('clean');
    expect(document.documentElement.getAttribute('data-theme')).toBe('clean');
  });
});
