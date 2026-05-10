import { describe, expect, it } from 'vitest';
import { COST_DEFAULT } from './logic';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';

describe('bcrypt url-state', () => {
  it('round-trips default state', () => {
    const { search, hash } = serializeParams(DEFAULT_STATE);
    expect([...search.keys()]).toHaveLength(0);
    expect([...hash.keys()]).toHaveLength(0);
  });

  it('serializes mode + cost when non-default', () => {
    const { search } = serializeParams({ mode: 'verify', cost: 12 });
    expect(search.get('mode')).toBe('verify');
    expect(search.get('cost')).toBe('12');
  });

  it('parses valid params', () => {
    const s = parseParams(
      new URLSearchParams('mode=verify&cost=8'),
      new URLSearchParams(),
    );
    expect(s.mode).toBe('verify');
    expect(s.cost).toBe(8);
  });

  it('falls back to defaults on garbage', () => {
    const s = parseParams(
      new URLSearchParams('mode=banana&cost=99'),
      new URLSearchParams(),
    );
    expect(s.mode).toBe('hash');
    expect(s.cost).toBe(COST_DEFAULT);
  });
});
