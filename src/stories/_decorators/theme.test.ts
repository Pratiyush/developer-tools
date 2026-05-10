import { describe, expect, it } from 'vitest';
import { applyThemeGlobals, themeDecorator } from './theme';

describe('applyThemeGlobals', () => {
  it('writes theme, preset, density to dataset', () => {
    const root = document.createElement('div');
    applyThemeGlobals({ theme: 'aurora', preset: 'aurora', density: 'compact' }, root);
    expect(root.dataset.theme).toBe('aurora');
    expect(root.dataset.preset).toBe('aurora');
    expect(root.dataset.density).toBe('compact');
  });

  it('skips empty values without overwriting existing dataset attrs', () => {
    const root = document.createElement('div');
    root.dataset.theme = 'clean';
    applyThemeGlobals({ theme: '', preset: 'linear' }, root);
    expect(root.dataset.theme).toBe('clean');
    expect(root.dataset.preset).toBe('linear');
    expect(root.dataset.density).toBeUndefined();
  });

  it('skips undefined values', () => {
    const root = document.createElement('div');
    applyThemeGlobals({ theme: 'matrix' }, root);
    expect(root.dataset.theme).toBe('matrix');
    expect(root.dataset.preset).toBeUndefined();
    expect(root.dataset.density).toBeUndefined();
  });
});

describe('themeDecorator', () => {
  it('applies globals to document.documentElement before invoking the story', () => {
    let called = false;
    const story = (): string => {
      called = true;
      return 'rendered';
    };
    const result = themeDecorator(story, {
      globals: { theme: 'paper', preset: 'paper', density: 'default' },
    });
    expect(called).toBe(true);
    expect(result).toBe('rendered');
    expect(document.documentElement.dataset.theme).toBe('paper');
    expect(document.documentElement.dataset.preset).toBe('paper');
    expect(document.documentElement.dataset.density).toBe('default');
  });

  it('passes the context through to the wrapped story', () => {
    const seen: string[] = [];
    const story = (ctx: { globals: { theme?: string } }): null => {
      if (ctx.globals.theme !== undefined) seen.push(ctx.globals.theme);
      return null;
    };
    themeDecorator(story, { globals: { theme: 'swiss' } });
    expect(seen).toEqual(['swiss']);
  });
});
