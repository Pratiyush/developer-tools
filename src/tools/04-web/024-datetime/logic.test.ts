import { describe, expect, it } from 'vitest';
import { formatDate, parseDateInput } from './logic';

describe('datetime logic', () => {
  it('parses ISO-8601', () => {
    const r = parseDateInput('2024-06-15T12:00:00Z');
    expect(r?.source).toBe('iso');
    expect(r?.date.getUTCFullYear()).toBe(2024);
  });
  it('parses unix seconds', () => {
    const r = parseDateInput('1700000000');
    expect(r?.source).toBe('unix-s');
  });
  it('parses unix milliseconds', () => {
    const r = parseDateInput('1700000000000');
    expect(r?.source).toBe('unix-ms');
  });
  it('rejects garbage', () => {
    expect(parseDateInput('not a date')).toBeNull();
  });
  it('formatDate emits all forms', () => {
    const f = formatDate(new Date('2024-06-15T12:00:00Z'));
    expect(f.iso).toBe('2024-06-15T12:00:00.000Z');
    expect(f.unixSeconds).toBe('1718452800');
    expect(f.unixMillis).toBe('1718452800000');
    expect(f.utc).toMatch(/Sat, 15 Jun 2024/);
  });
  it('relative time labels', () => {
    const now = new Date('2024-06-15T12:00:00Z');
    const past = new Date('2024-06-15T11:30:00Z');
    expect(formatDate(past, now).relative).toMatch(/30 minutes ago/);
    const future = new Date('2024-06-15T14:00:00Z');
    expect(formatDate(future, now).relative).toMatch(/in 2 hours/);
  });
});
