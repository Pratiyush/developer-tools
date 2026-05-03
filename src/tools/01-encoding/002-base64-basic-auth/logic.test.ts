import { describe, expect, it } from 'vitest';
import { decodeBasicAuth, encodeBasicAuth, isValidBasicAuth } from './logic';

describe('encodeBasicAuth', () => {
  it('encodes the canonical RFC 7617 example', () => {
    expect(encodeBasicAuth({ username: 'aladdin', password: 'open sesame' })).toBe(
      'Basic YWxhZGRpbjpvcGVuIHNlc2FtZQ==',
    );
  });

  it('encodes empty credentials as a valid header', () => {
    expect(encodeBasicAuth({ username: '', password: '' })).toBe('Basic Og==');
  });

  it('round-trips UTF-8 (CJK + emoji) in either field', () => {
    const creds = { username: '日本語', password: 'パスワード🔐' };
    const header = encodeBasicAuth(creds);
    expect(decodeBasicAuth(header)).toEqual(creds);
  });

  it('preserves colons inside the password (split is on first colon)', () => {
    const creds = { username: 'admin', password: 'a:b:c' };
    const header = encodeBasicAuth(creds);
    expect(decodeBasicAuth(header)).toEqual(creds);
  });

  it('preserves whitespace and special characters', () => {
    const creds = { username: 'user with space', password: '  pad  ' };
    expect(decodeBasicAuth(encodeBasicAuth(creds))).toEqual(creds);
  });
});

describe('decodeBasicAuth', () => {
  it('decodes a header with the Basic prefix', () => {
    expect(decodeBasicAuth('Basic YWxhZGRpbjpvcGVuIHNlc2FtZQ==')).toEqual({
      username: 'aladdin',
      password: 'open sesame',
    });
  });

  it('decodes the bare base64 token without prefix', () => {
    expect(decodeBasicAuth('YWxhZGRpbjpvcGVuIHNlc2FtZQ==')).toEqual({
      username: 'aladdin',
      password: 'open sesame',
    });
  });

  it('accepts the prefix in any case', () => {
    expect(decodeBasicAuth('basic YWxhZGRpbjpvcGVuIHNlc2FtZQ==')).not.toBeNull();
    expect(decodeBasicAuth('BASIC YWxhZGRpbjpvcGVuIHNlc2FtZQ==')).not.toBeNull();
    expect(decodeBasicAuth('  Basic   YWxhZGRpbjpvcGVuIHNlc2FtZQ==  ')).not.toBeNull();
  });

  it('returns null for empty input', () => {
    expect(decodeBasicAuth('')).toBeNull();
    expect(decodeBasicAuth('   ')).toBeNull();
    expect(decodeBasicAuth('Basic ')).toBeNull();
  });

  it('returns null for malformed base64', () => {
    expect(decodeBasicAuth('Basic !!!')).toBeNull();
    expect(decodeBasicAuth('Basic abc')).toBeNull(); // not multiple of 4
  });

  it('returns null when the decoded payload has no colon separator', () => {
    // base64 of "nocolon" — valid base64, missing colon
    expect(decodeBasicAuth('Basic bm9jb2xvbg==')).toBeNull();
  });

  it('returns null for invalid UTF-8 in the payload', () => {
    // base64 of a byte sequence that's not valid UTF-8 (lone continuation 0x80)
    expect(decodeBasicAuth('Basic gA==')).toBeNull();
  });
});

describe('isValidBasicAuth', () => {
  it('returns true for a well-formed header', () => {
    expect(isValidBasicAuth('Basic YWxhZGRpbjpvcGVuIHNlc2FtZQ==')).toBe(true);
  });

  it('returns false for empty / malformed input', () => {
    expect(isValidBasicAuth('')).toBe(false);
    expect(isValidBasicAuth('Basic !!!')).toBe(false);
    expect(isValidBasicAuth('Basic bm9jb2xvbg==')).toBe(false);
  });
});
