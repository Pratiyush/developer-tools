/**
 * HTTP Basic Authentication header helpers.
 *
 * The wire format (RFC 7617):
 *   Authorization: Basic <base64(user ":" pass)>
 *
 * The credentials are joined with a colon and base64-encoded. Decoding splits
 * on the FIRST colon — colons inside the password are preserved.
 *
 * This module reimplements the byte-level base64 round-trip rather than
 * importing tool 001's logic, per the project's strict tool-isolation rule
 * (`feedback_tool_isolation`). The implementation is deliberately small.
 */

export interface BasicAuthCredentials {
  readonly username: string;
  readonly password: string;
}

const BASIC_PREFIX = /^\s*Basic\s+/i;

/**
 * Encode a username/password pair into a complete `Basic <token>` header
 * value. UTF-8 in either field round-trips.
 *
 * Per RFC 7617, the username MUST NOT contain a colon — but the encoder
 * permits it for symmetry with the decoder, since a server reading the
 * encoded value can't distinguish anyway.
 *
 * @example
 *   encodeBasicAuth('aladdin', 'open sesame')
 *     // "Basic YWxhZGRpbjpvcGVuIHNlc2FtZQ=="
 */
export function encodeBasicAuth(credentials: BasicAuthCredentials): string {
  const joined = `${credentials.username}:${credentials.password}`;
  return `Basic ${utf8ToBase64(joined)}`;
}

/**
 * Decode a Basic Authorization header (with or without the `Basic ` prefix)
 * back to a username/password pair. Splits on the first colon — extra colons
 * stay in the password field.
 *
 * Returns `null` if the input is malformed (bad base64, invalid UTF-8, or
 * missing colon separator).
 *
 * @example
 *   decodeBasicAuth('Basic YWxhZGRpbjpvcGVuIHNlc2FtZQ==')
 *     // { username: 'aladdin', password: 'open sesame' }
 *   decodeBasicAuth('YWxhZGRpbjpvcGVuIHNlc2FtZQ==')
 *     // same — prefix is optional
 *   decodeBasicAuth('not base64!!')
 *     // null
 */
export function decodeBasicAuth(header: string): BasicAuthCredentials | null {
  const trimmed = header.replace(BASIC_PREFIX, '').trim();
  if (trimmed === '') return null;
  const decoded = base64ToUtf8(trimmed);
  if (decoded === null) return null;
  const sep = decoded.indexOf(':');
  if (sep === -1) return null;
  return {
    username: decoded.slice(0, sep),
    password: decoded.slice(sep + 1),
  };
}

/**
 * True if the input parses as a valid Basic auth header. Accepts the
 * optional `Basic ` prefix; rejects anything that doesn't decode to a
 * `user:pass` shape.
 */
export function isValidBasicAuth(header: string): boolean {
  return decodeBasicAuth(header) !== null;
}

/** UTF-8-safe base64 encode. Mirrors tool 001's approach without sharing code. */
function utf8ToBase64(input: string): string {
  if (input === '') return '';
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

/** UTF-8-safe base64 decode. Returns null instead of throwing on bad input. */
function base64ToUtf8(input: string): string | null {
  // Standard alphabet only — Basic auth uses standard, not URL-safe.
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(input)) return null;
  if (input.length % 4 !== 0) return null;
  let binary: string;
  try {
    binary = atob(input);
  } catch {
    return null;
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}
