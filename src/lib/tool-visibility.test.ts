import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ToolModule } from './types';
import {
  DEFAULT_VISIBILITY,
  STORAGE_KEY,
  applyVisibility,
  getVisibility,
  onVisibilityChange,
  setVisibility,
  showAll,
  showOnly,
} from './tool-visibility';

interface FakeState {
  readonly mode: 'all' | 'subset';
  readonly ids: readonly string[];
}

function fakeTool(id: string): ToolModule<unknown> {
  const t: ToolModule<unknown> = {
    id,
    number: 1,
    category: '01-encoding',
    name: id,
    description: '',
    tags: [],
    parseParams: () => undefined,
    serializeParams: () => ({ search: new URLSearchParams(), hash: new URLSearchParams() }),
    render: () => ({
      dispose: () => {
        // intentional no-op — the registry contract only requires the
        // method exists and is callable.
      },
    }),
  };
  return t;
}

function memStorage(): Storage {
  const m = new Map<string, string>();
  return {
    get length() {
      return m.size;
    },
    clear() {
      m.clear();
    },
    getItem(k) {
      return m.get(k) ?? null;
    },
    key(i) {
      return Array.from(m.keys())[i] ?? null;
    },
    removeItem(k) {
      m.delete(k);
    },
    setItem(k, v) {
      m.set(k, v);
    },
  };
}

describe('tool-visibility', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  });

  afterEach(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  });

  it('returns DEFAULT when storage is empty', () => {
    const s = memStorage();
    expect(getVisibility(s)).toEqual(DEFAULT_VISIBILITY);
  });

  it('persists + reads back a subset state', () => {
    const s = memStorage();
    const state: FakeState = { mode: 'subset', ids: ['a', 'b'] };
    s.setItem(STORAGE_KEY, JSON.stringify(state));
    expect(getVisibility(s)).toEqual(state);
  });

  it('falls back to DEFAULT on garbage JSON', () => {
    const s = memStorage();
    s.setItem(STORAGE_KEY, 'not-json{');
    expect(getVisibility(s)).toEqual(DEFAULT_VISIBILITY);
  });

  it('falls back to DEFAULT on wrong shape', () => {
    const s = memStorage();
    s.setItem(STORAGE_KEY, JSON.stringify({ mode: 'mystery', ids: 7 }));
    expect(getVisibility(s)).toEqual(DEFAULT_VISIBILITY);
  });

  it('applyVisibility returns the original list when mode is "all"', () => {
    const tools = [fakeTool('one'), fakeTool('two'), fakeTool('three')];
    const filtered = applyVisibility(tools, { mode: 'all', ids: [] });
    expect(filtered).toHaveLength(3);
  });

  it('applyVisibility filters to the chosen IDs', () => {
    const tools = [fakeTool('one'), fakeTool('two'), fakeTool('three')];
    const filtered = applyVisibility(tools, { mode: 'subset', ids: ['two'] });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe('two');
  });

  it('applyVisibility on empty subset returns empty list', () => {
    const tools = [fakeTool('one'), fakeTool('two')];
    const filtered = applyVisibility(tools, { mode: 'subset', ids: [] });
    expect(filtered).toHaveLength(0);
  });

  it('applyVisibility preserves original order', () => {
    const tools = [fakeTool('a'), fakeTool('b'), fakeTool('c')];
    const filtered = applyVisibility(tools, { mode: 'subset', ids: ['c', 'a'] });
    expect(filtered.map((t) => t.id)).toEqual(['a', 'c']);
  });

  it('showOnly produces a single-ID subset state', () => {
    expect(showOnly('xyz')).toEqual({ mode: 'subset', ids: ['xyz'] });
  });

  it('showAll preserves the previously stored IDs', () => {
    setVisibility({ mode: 'subset', ids: ['p', 'q'] });
    const next = showAll();
    expect(next.mode).toBe('all');
    expect(next.ids).toEqual(['p', 'q']);
  });

  it('onVisibilityChange fires on setVisibility', () => {
    const cb = vi.fn();
    const off = onVisibilityChange(cb);
    setVisibility({ mode: 'subset', ids: ['a'] });
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith({ mode: 'subset', ids: ['a'] });
    off();
    setVisibility({ mode: 'all', ids: ['a'] });
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
