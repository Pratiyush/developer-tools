/**
 * Inline SVG illustrations — bigger than icons, used for empty / error /
 * 404 states. Stroke uses `currentColor` so they pick up the active theme.
 *
 * Style: friendly, line-based, faintly humorous (see `feedback_funny_errors`).
 */

const ILLUSTRATIONS = {
  /**
   * "Lost" — an open-but-empty toolbox with a thought bubble holding a "?".
   * For 404 / not-found views.
   */
  lost: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="40" y="80" width="140" height="80" rx="8" />
    <path d="M70 80 V58 a14 14 0 0 1 14 -14 h52 a14 14 0 0 1 14 14 v22" />
    <line x1="40" y1="110" x2="180" y2="110" />
    <line x1="100" y1="80" x2="100" y2="110" stroke-dasharray="3 4" opacity="0.5" />
    <line x1="120" y1="80" x2="120" y2="110" stroke-dasharray="3 4" opacity="0.5" />
    <circle cx="200" cy="50" r="22" />
    <text x="200" y="58" text-anchor="middle" font-size="26" font-weight="700" fill="currentColor" stroke="none" font-family="ui-monospace, monospace">?</text>
    <circle cx="172" cy="76" r="2" fill="currentColor" stroke="none" />
    <circle cx="180" cy="68" r="1.5" fill="currentColor" stroke="none" />
  </svg>`,

  /**
   * "Broken" — a wrench with a small spark. For generic unknown errors.
   */
  broken: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M70 130 l52 -52 a18 18 0 0 1 -22 -22 l-26 26 a18 18 0 0 1 22 22 z" transform="rotate(-30 96 104)" />
    <path d="M150 70 l-8 -8 m16 0 l-8 8 m8 -8 l-8 -8" stroke-width="2.5" />
    <circle cx="158" cy="62" r="3" fill="currentColor" stroke="none" />
    <path d="M180 100 l8 8 m0 -8 l-8 8" stroke-width="2.5" />
  </svg>`,
} as const;

export type IllustrationName = keyof typeof ILLUSTRATIONS;

export interface IllustrationOptions {
  size?: number;
  className?: string;
  ariaLabel?: string;
}

export function illustration(
  name: IllustrationName,
  options: IllustrationOptions = {},
): HTMLSpanElement {
  const span = document.createElement('span');
  span.classList.add('dt-illustration');
  if (options.className) span.classList.add(options.className);
  const size = options.size ?? 160;
  span.style.display = 'inline-block';
  span.style.width = `${String(size)}px`;
  span.style.height = `${String(Math.round(size * 0.75))}px`;
  span.innerHTML = ILLUSTRATIONS[name];
  if (options.ariaLabel) {
    span.setAttribute('role', 'img');
    span.setAttribute('aria-label', options.ariaLabel);
  } else {
    span.setAttribute('aria-hidden', 'true');
  }
  return span;
}
