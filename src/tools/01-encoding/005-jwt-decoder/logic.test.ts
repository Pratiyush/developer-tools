import { describe, expect, it } from 'vitest';
import {
  decodeJwt,
  formatTimestamp,
  isExpired,
  verifyJwtHmac,
  isNotYetValid,
  readTimestamp,
} from './logic';

/**
 * A canonical HS256 token from RFC 7519 §3.1 (slightly reformatted so the
 * signature segment is non-empty but irrelevant — we never verify it).
 */
const RFC_TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9' +
  '.eyJpc3MiOiJqb2UiLCJleHAiOjEzMDA4MTkzODAsImh0dHA6Ly9leGFtcGxlLmNvbS9pc19yb290Ijp0cnVlfQ' +
  '.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';

describe('decodeJwt', () => {
  it('decodes a canonical JWT (RFC 7519 §3.1)', () => {
    const r = decodeJwt(RFC_TOKEN);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.header).toEqual({ typ: 'JWT', alg: 'HS256' });
    expect(r.payload).toMatchObject({ iss: 'joe', exp: 1300819380 });
    expect(r.signature).toBe('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk');
  });

  it('produces pretty-printed header and payload', () => {
    const r = decodeJwt(RFC_TOKEN);
    if (!r.ok) throw new Error('expected ok');
    expect(r.headerPretty).toContain('"alg": "HS256"');
    expect(r.payloadPretty).toContain('"iss": "joe"');
    expect(r.headerPretty.split('\n').length).toBeGreaterThan(1);
  });

  it('strips a leading Bearer prefix', () => {
    const r = decodeJwt(`Bearer  ${RFC_TOKEN}`);
    expect(r.ok).toBe(true);
  });

  it('tolerates surrounding whitespace and newlines', () => {
    const r = decodeJwt(`\n  ${RFC_TOKEN}  \n`);
    expect(r.ok).toBe(true);
  });

  it('handles unsigned tokens (alg=none, empty third segment)', () => {
    // header={alg:none,typ:JWT}, payload={sub:1}, signature empty
    const t = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOjF9.';
    const r = decodeJwt(t);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.header).toEqual({ alg: 'none', typ: 'JWT' });
    expect(r.signature).toBe('');
  });

  it('decodes UTF-8 in payload claims', () => {
    // header={alg:HS256}, payload={name:"日本語"}
    const t = 'eyJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoi5pel5pys6Kqe' + 'In0.sig';
    const r = decodeJwt(t);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.payload).toEqual({ name: '日本語' });
  });

  it('rejects malformed shape (not three dot-separated segments)', () => {
    expect(decodeJwt('').ok).toBe(false);
    expect(decodeJwt('a.b').ok).toBe(false);
    expect(decodeJwt('abc').ok).toBe(false);
    const r = decodeJwt('a.b');
    if (!r.ok) expect(r.reason).toBe('shape');
  });

  it('rejects invalid base64url in header', () => {
    const r = decodeJwt('!!!.eyJzdWIiOjF9.sig');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('header');
  });

  it('rejects non-JSON payload', () => {
    // payload is base64url("not json") = "bm90IGpzb24"
    const r = decodeJwt('eyJhbGciOiJIUzI1NiJ9.bm90IGpzb24.sig');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('payload');
  });

  it('rejects header that decodes to JSON but not an object (array)', () => {
    // header is base64url("[1,2,3]") = "WzEsMiwzXQ"
    const r = decodeJwt('WzEsMiwzXQ.eyJzdWIiOjF9.sig');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('header');
  });
});

describe('readTimestamp', () => {
  it('reads a numeric claim', () => {
    expect(readTimestamp({ exp: 1700000000 }, 'exp')).toBe(1700000000);
  });

  it('reads a numeric-string claim', () => {
    expect(readTimestamp({ iat: '1700000000' }, 'iat')).toBe(1700000000);
  });

  it('returns null for a missing claim', () => {
    expect(readTimestamp({}, 'exp')).toBeNull();
  });

  it('returns null for a non-numeric claim', () => {
    expect(readTimestamp({ exp: 'soon' }, 'exp')).toBeNull();
    expect(readTimestamp({ exp: true }, 'exp')).toBeNull();
  });
});

describe('isExpired / isNotYetValid', () => {
  const FUTURE = 9_999_999_999;
  const PAST = 1;

  it('isExpired: past exp → true', () => {
    expect(isExpired({ exp: PAST })).toBe(true);
  });

  it('isExpired: future exp → false', () => {
    expect(isExpired({ exp: FUTURE })).toBe(false);
  });

  it('isExpired: missing exp → false', () => {
    expect(isExpired({})).toBe(false);
  });

  it('isNotYetValid: future nbf → true', () => {
    expect(isNotYetValid({ nbf: FUTURE })).toBe(true);
  });

  it('isNotYetValid: past nbf → false', () => {
    expect(isNotYetValid({ nbf: PAST })).toBe(false);
  });
});

describe('formatTimestamp', () => {
  it('renders an ISO-8601 string', () => {
    expect(formatTimestamp(0)).toBe('1970-01-01T00:00:00.000Z');
    expect(formatTimestamp(1700000000)).toBe('2023-11-14T22:13:20.000Z');
  });
});

describe('verifyJwtHmac', () => {
  /** Mint a JWT by signing `header.payload` with a UTF-8 secret using
   *  WebCrypto. We need a self-generated token because RFC 7519 §A.1's
   *  reference uses raw-byte key material that doesn't round-trip
   *  through a UTF-8 string secret. The point of this test is the
   *  verifier, not the signer. */
  async function mintToken(
    payload: Record<string, unknown>,
    secret: string,
    alg: 'HS256' | 'HS384' | 'HS512' = 'HS256',
  ): Promise<string> {
    const header = { alg, typ: 'JWT' };
    const enc = new TextEncoder();
    const b64u = (b: Uint8Array): string => {
      let bin = '';
      for (const x of b) bin += String.fromCharCode(x);
      return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    };
    const headerSeg = b64u(enc.encode(JSON.stringify(header)));
    const payloadSeg = b64u(enc.encode(JSON.stringify(payload)));
    const signingInput = `${headerSeg}.${payloadSeg}`;
    const hashName = alg === 'HS256' ? 'SHA-256' : alg === 'HS384' ? 'SHA-384' : 'SHA-512';
    // Pass Uint8Array views directly — Node 20's WebCrypto rejects bare
    // ArrayBuffers across realms; TypedArrays work everywhere.
    const keyBuf = enc.encode(secret);
    const inputBuf = enc.encode(signingInput);
    const key = await crypto.subtle.importKey(
      'raw',
      keyBuf,
      { name: 'HMAC', hash: { name: hashName } },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, inputBuf);
    return `${signingInput}.${b64u(new Uint8Array(sig))}`;
  }

  it('verifies a self-minted HS256 token with the right secret', async () => {
    const token = await mintToken({ sub: 'alice', iat: 1700000000 }, 'shhh-its-secret');
    const r = await verifyJwtHmac(token, 'shhh-its-secret');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.match).toBe(true);
    expect(r.algo).toBe('HS256');
  });

  it('rejects the right token with the wrong secret', async () => {
    const token = await mintToken({ sub: 'alice' }, 'shhh-its-secret');
    const r = await verifyJwtHmac(token, 'definitely-not-the-secret');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.match).toBe(false);
  });

  it('returns shape error on garbage input', async () => {
    const r = await verifyJwtHmac('not.a.token', 'whatever');
    expect(r.ok).toBe(false);
  });

  it('refuses non-HMAC algs', async () => {
    // RS256 token (synthetic header — body doesn't matter, we should
    // bail before signature verification on the alg check alone).
    const header = btoa('{"alg":"RS256","typ":"JWT"}')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const body = btoa('{}')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const token = `${header}.${body}.fakesignature`;
    const r = await verifyJwtHmac(token, 'anything');
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.reason).toBe('unsupported');
  });
});
