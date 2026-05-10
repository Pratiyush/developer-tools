import { describe, expect, it } from 'vitest';
import { testRegex } from './logic';

describe('regex logic', () => {
  it('returns matches with capture groups', () => {
    const r = testRegex('(\\w+)@(\\w+)', '', 'a@x b@y c@z');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.matches).toHaveLength(3);
      expect(r.matches[0]).toMatchObject({ match: 'a@x', groups: ['a', 'x'] });
    }
  });

  it('honours i flag', () => {
    const r = testRegex('hello', 'i', 'HELLO World');
    expect(r.ok && r.matches[0]?.match).toBe('HELLO');
  });

  it('returns error on bad pattern', () => {
    const r = testRegex('(unclosed', '', 'x');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBeTruthy();
  });

  it('avoids infinite loop on empty match', () => {
    const r = testRegex('a*', '', 'b');
    expect(r.ok).toBe(true);
  });

  it('captures ES2018 named groups', () => {
    const r = testRegex('(?<user>\\w+)@(?<host>\\w+)', '', 'alice@example bob@test');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.matches[0]?.namedGroups).toEqual({ user: 'alice', host: 'example' });
    expect(r.matches[1]?.namedGroups).toEqual({ user: 'bob', host: 'test' });
  });

  it('returns empty namedGroups when none defined', () => {
    const r = testRegex('\\w+', '', 'hello');
    expect(r.ok && Object.keys(r.matches[0]?.namedGroups ?? {})).toEqual([]);
  });
});
