import { describe, it, expect } from 'vitest';
import { process } from './logic';

describe('__SLUG__ logic', () => {
  it('uppercases input as a placeholder', () => {
    expect(process('hello')).toBe('HELLO');
  });
});
