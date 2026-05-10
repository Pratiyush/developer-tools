import { describe, expect, it } from 'vitest';
import { decodeBase64, encodeFile } from './logic';

describe('base64-file logic', () => {
  it('encodeFile: round-trips a small text file', async () => {
    const text = 'Hello, world!';
    const file = new File([text], 'hello.txt', { type: 'text/plain' });
    const encoded = await encodeFile(file);
    expect(encoded.bytes).toBe(text.length);
    expect(encoded.mime).toBe('text/plain');
    expect(encoded.filename).toBe('hello.txt');
    expect(encoded.base64).toBe('SGVsbG8sIHdvcmxkIQ==');
    expect(encoded.dataUri).toBe('data:text/plain;base64,SGVsbG8sIHdvcmxkIQ==');
  });

  it('encodeFile: handles missing MIME (octet-stream fallback)', async () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'bytes.bin');
    const encoded = await encodeFile(file);
    expect(encoded.mime).toBe('application/octet-stream');
    expect(encoded.base64).toBe('AQID');
  });

  it('decodeBase64: strips data-URI prefix and decodes', () => {
    const r = decodeBase64('data:text/plain;base64,SGVsbG8sIHdvcmxkIQ==');
    expect(r).not.toBeNull();
    if (!r) return;
    expect(r.mime).toBe('text/plain');
    expect(new TextDecoder().decode(r.bytes)).toBe('Hello, world!');
  });

  it('decodeBase64: bare base64 without prefix', () => {
    const r = decodeBase64('SGVsbG8sIHdvcmxkIQ==');
    expect(r).not.toBeNull();
    if (!r) return;
    expect(new TextDecoder().decode(r.bytes)).toBe('Hello, world!');
  });

  it('decodeBase64: tolerates whitespace / line breaks', () => {
    // "Hello, world!" → SGVsbG8sIHdvcmxkIQ== with line breaks injected.
    const r = decodeBase64('SGVs\nbG8s\nIHdv\ncmxk\nIQ ==');
    expect(r).not.toBeNull();
    if (r) expect(new TextDecoder().decode(r.bytes)).toBe('Hello, world!');
  });

  it('decodeBase64: returns null on garbage', () => {
    expect(decodeBase64('not base64!@#')).toBeNull();
    expect(decodeBase64('')).toBeNull();
  });
});
