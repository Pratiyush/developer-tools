/**
 * User-Agent string parser. Matches a small set of common browsers + OS;
 * returns "unknown" on no-match (rather than guessing). Ships zero data
 * tables — pure regex.
 */

export interface ParsedUA {
  readonly browser: { name: string; version: string };
  readonly os: { name: string; version: string };
  readonly device: { type: 'mobile' | 'tablet' | 'desktop' | 'bot' | 'unknown' };
  readonly raw: string;
}

const BROWSER_RULES: readonly (readonly [RegExp, string, RegExp?])[] = [
  [/Edg\/([0-9.]+)/, 'Edge'],
  [/OPR\/([0-9.]+)/, 'Opera'],
  [/Firefox\/([0-9.]+)/, 'Firefox'],
  [/Chrome\/([0-9.]+)/, 'Chrome'],
  [/Version\/([0-9.]+).*Safari\//, 'Safari'],
  [/Safari\/([0-9.]+)/, 'Safari'],
  [/MSIE ([0-9.]+)/, 'Internet Explorer'],
  [/Trident\/.*rv:([0-9.]+)/, 'Internet Explorer'],
];

const OS_RULES: readonly (readonly [RegExp, string])[] = [
  [/Windows NT ([0-9.]+)/, 'Windows'],
  [/Mac OS X ([0-9_.]+)/, 'macOS'],
  [/iPhone OS ([0-9_]+)/, 'iOS'],
  [/iPad.*OS ([0-9_]+)/, 'iPadOS'],
  [/Android ([0-9.]+)/, 'Android'],
  [/Linux/, 'Linux'],
  [/CrOS/, 'ChromeOS'],
];

export function parseUserAgent(ua: string): ParsedUA {
  const raw = ua.trim();
  let browser = { name: 'unknown', version: '' };
  for (const [re, name] of BROWSER_RULES) {
    const m = re.exec(raw);
    if (m) {
      browser = { name, version: m[1] ?? '' };
      break;
    }
  }
  let os = { name: 'unknown', version: '' };
  for (const [re, name] of OS_RULES) {
    const m = re.exec(raw);
    if (m) {
      os = { name, version: (m[1] ?? '').replace(/_/g, '.') };
      break;
    }
  }
  let device: ParsedUA['device']['type'] = 'desktop';
  if (/bot|crawl|spider|slurp|search/i.test(raw)) device = 'bot';
  else if (/Mobile|iPhone|Android.*Mobile/i.test(raw)) device = 'mobile';
  else if (/iPad|Tablet|Android(?!.*Mobile)/i.test(raw)) device = 'tablet';
  if (!raw) device = 'unknown';
  return { browser, os, device: { type: device }, raw };
}
