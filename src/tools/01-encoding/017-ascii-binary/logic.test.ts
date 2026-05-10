import { describe, expect, it } from 'vitest';
import { binaryToText, textToBinary } from './logic';

describe('ascii-binary logic', () => {
  it('encodes ASCII', () => {
    expect(textToBinary('A')).toBe('01000001');
    expect(textToBinary('hi', '')).toBe('0110100001101001');
  });

  it('encodes UTF-8 emoji', () => {
    const out = textToBinary('🍣');
    expect(out.split(' ')).toHaveLength(4); // 4 bytes
  });

  it('decodes binary', () => {
    expect(binaryToText('01000001')).toBe('A');
    expect(binaryToText('01101000 01101001')).toBe('hi');
  });

  it('round-trips emoji', () => {
    expect(binaryToText(textToBinary('🍣'))).toBe('🍣');
  });

  it('returns null on bad binary', () => {
    expect(binaryToText('01010')).toBeNull();
    expect(binaryToText('')).toBeNull();
  });
});
