/**
 * SB-10 (#48) — coverage exemptions.
 *
 * Each entry MUST include a non-empty `justification` string. CI does not
 * accept an entry without one.
 *
 * **Current state (2026-05-10):** the catalog ships ~35 tools that pre-date
 * the Storybook design system (#70 — Storybook-first, live-app-after).
 * These are exempted en bloc; each entry should be removed individually as
 * its story is authored. The base64 string converter (#80 / SB-04) was the
 * first to graduate from this list.
 *
 * Adding a brand-new tool without a story → CI failure (the generator
 * scaffolds the story automatically, so this only catches retro-fits).
 */

export interface CoverageExemption {
  readonly slug: string;
  readonly justification: string;
}

const RETRO_FIT_REASON =
  'Pre-Storybook tool; story to be added in the post-design-system retro-fit wave (see #70 policy).';

export const EXEMPT_TOOLS: readonly CoverageExemption[] = [
  { slug: 'ascii-binary', justification: RETRO_FIT_REASON },
  { slug: 'base-converter', justification: RETRO_FIT_REASON },
  { slug: 'base64-basic-auth', justification: RETRO_FIT_REASON },
  { slug: 'base64-file', justification: RETRO_FIT_REASON },
  { slug: 'bcrypt', justification: RETRO_FIT_REASON },
  { slug: 'bip39', justification: RETRO_FIT_REASON },
  { slug: 'case', justification: RETRO_FIT_REASON },
  { slug: 'chmod', justification: RETRO_FIT_REASON },
  { slug: 'color', justification: RETRO_FIT_REASON },
  { slug: 'datetime', justification: RETRO_FIT_REASON },
  { slug: 'diff', justification: RETRO_FIT_REASON },
  { slug: 'encrypt', justification: RETRO_FIT_REASON },
  { slug: 'format-json', justification: RETRO_FIT_REASON },
  { slug: 'hash', justification: RETRO_FIT_REASON },
  { slug: 'hmac', justification: RETRO_FIT_REASON },
  { slug: 'html-entities', justification: RETRO_FIT_REASON },
  { slug: 'json-toml', justification: RETRO_FIT_REASON },
  { slug: 'json-yaml', justification: RETRO_FIT_REASON },
  { slug: 'jwt-decoder', justification: RETRO_FIT_REASON },
  { slug: 'lorem', justification: RETRO_FIT_REASON },
  { slug: 'math-eval', justification: RETRO_FIT_REASON },
  { slug: 'nato', justification: RETRO_FIT_REASON },
  { slug: 'password', justification: RETRO_FIT_REASON },
  { slug: 'regex', justification: RETRO_FIT_REASON },
  { slug: 'roman', justification: RETRO_FIT_REASON },
  { slug: 'rsa-keypair', justification: RETRO_FIT_REASON },
  { slug: 'text-unicode', justification: RETRO_FIT_REASON },
  { slug: 'token-generator', justification: RETRO_FIT_REASON },
  { slug: 'ulid', justification: RETRO_FIT_REASON },
  { slug: 'url-encode-decode', justification: RETRO_FIT_REASON },
  { slug: 'user-agent', justification: RETRO_FIT_REASON },
  { slug: 'uuid', justification: RETRO_FIT_REASON },
  { slug: 'wordcount', justification: RETRO_FIT_REASON },
  { slug: 'yaml-json', justification: RETRO_FIT_REASON },
  { slug: 'yaml-toml', justification: RETRO_FIT_REASON },
  // `base64-string-converter` graduated in #80 / SB-04 — DO NOT add it here.
];
