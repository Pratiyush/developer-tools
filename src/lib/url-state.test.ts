import { describe, expect, it, vi } from 'vitest';
import {
  applyURL,
  debounceUpdate,
  parseURL,
  type ReadableLocation,
  type WritableHistory,
} from './url-state';

function makeLocation(search: string, hash: string): ReadableLocation {
  return { pathname: '/developer-tools/', search, hash };
}

describe('parseURL', () => {
  it('returns empty maps when neither search nor hash is set', () => {
    const { search, hash } = parseURL(makeLocation('', ''));
    expect(Array.from(search.entries())).toEqual([]);
    expect(Array.from(hash.entries())).toEqual([]);
  });

  it('parses query parameters from the search string', () => {
    const { search } = parseURL(makeLocation('?mode=encode&urlsafe=1', ''));
    expect(search.get('mode')).toBe('encode');
    expect(search.get('urlsafe')).toBe('1');
  });

  it('parses hash parameters after stripping the leading #', () => {
    const { hash } = parseURL(makeLocation('', '#input=hello&extra=ok'));
    expect(hash.get('input')).toBe('hello');
    expect(hash.get('extra')).toBe('ok');
  });

  it('handles a hash with an embedded leading ? character', () => {
    const { hash } = parseURL(makeLocation('', '#?input=hello'));
    expect(hash.get('input')).toBe('hello');
  });

  it('decodes percent-encoded values', () => {
    const { search, hash } = parseURL(makeLocation('?text=hello%20world', '#input=%E6%97%A5'));
    expect(search.get('text')).toBe('hello world');
    expect(hash.get('input')).toBe('日');
  });
});

describe('applyURL', () => {
  function withMockHistory(): {
    history: WritableHistory;
    calls: { search: string; hash: string }[];
  } {
    const calls: { search: string; hash: string }[] = [];
    const history: WritableHistory = {
      state: null,
      replaceState: (_data, _unused, url) => {
        const u = new URL(String(url ?? ''), 'http://localhost/');
        calls.push({ search: u.search, hash: u.hash });
      },
    };
    return { history, calls };
  }

  it('omits ? when search is empty', () => {
    const { history, calls } = withMockHistory();
    applyURL(
      { search: new URLSearchParams(), hash: new URLSearchParams({ input: 'x' }) },
      makeLocation('', ''),
      history,
    );
    expect(calls.length).toBe(1);
    expect(calls[0]?.search).toBe('');
    expect(calls[0]?.hash).toBe('#input=x');
  });

  it('omits # when hash is empty', () => {
    const { history, calls } = withMockHistory();
    applyURL(
      { search: new URLSearchParams({ mode: 'decode' }), hash: new URLSearchParams() },
      makeLocation('', ''),
      history,
    );
    expect(calls.length).toBe(1);
    expect(calls[0]?.search).toBe('?mode=decode');
    expect(calls[0]?.hash).toBe('');
  });

  it('writes both search and hash when both are non-empty', () => {
    const { history, calls } = withMockHistory();
    applyURL(
      {
        search: new URLSearchParams({ mode: 'encode', urlsafe: '1' }),
        hash: new URLSearchParams({ input: 'hello' }),
      },
      makeLocation('', ''),
      history,
    );
    expect(calls[0]?.search).toBe('?mode=encode&urlsafe=1');
    expect(calls[0]?.hash).toBe('#input=hello');
  });
});

describe('debounceUpdate', () => {
  it('delays the call until the configured wait elapses', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounceUpdate(fn, 100);
    debounced();
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('coalesces rapid calls into a single trailing fire', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounceUpdate(fn, 50);
    debounced();
    vi.advanceTimersByTime(20);
    debounced();
    vi.advanceTimersByTime(20);
    debounced();
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
