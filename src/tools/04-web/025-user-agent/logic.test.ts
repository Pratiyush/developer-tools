import { describe, expect, it } from 'vitest';
import { parseUserAgent } from './logic';

describe('user-agent logic', () => {
  it('detects Chrome on Windows', () => {
    const r = parseUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    );
    expect(r.browser.name).toBe('Chrome');
    expect(r.os.name).toBe('Windows');
    expect(r.device.type).toBe('desktop');
  });

  it('detects Firefox on macOS', () => {
    const r = parseUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:128.0) Gecko/20100101 Firefox/128.0',
    );
    expect(r.browser.name).toBe('Firefox');
    expect(r.os.name).toBe('macOS');
  });

  it('detects mobile iPhone', () => {
    const r = parseUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Version/17.5 Mobile/15E148 Safari/604.1',
    );
    expect(r.os.name).toBe('iOS');
    expect(r.device.type).toBe('mobile');
  });

  it('detects bots', () => {
    const r = parseUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');
    expect(r.device.type).toBe('bot');
  });

  it('returns unknown for empty input', () => {
    const r = parseUserAgent('');
    expect(r.browser.name).toBe('unknown');
    expect(r.device.type).toBe('unknown');
  });
});
