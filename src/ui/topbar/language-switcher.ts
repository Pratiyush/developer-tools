import { translate, setLocale, type LocaleCode } from '../../lib/i18n';
import { LOCALES } from '../../locales';
import { dropdown, icon, type DropdownHandle, type DropdownOption } from '../primitives';

/**
 * Flag emoji per recognized locale. Picks a canonical reference flag for
 * each language — not a country claim. English uses 🇬🇧 to avoid implying
 * US-only English; Portuguese uses 🇵🇹 for European Portuguese parity.
 */
const FLAG: Record<LocaleCode, string> = {
  en: '🇬🇧',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  pt: '🇵🇹',
  it: '🇮🇹',
  nl: '🇳🇱',
  pl: '🇵🇱',
  ru: '🇷🇺',
  tr: '🇹🇷',
  ja: '🇯🇵',
  zh: '🇨🇳',
  ko: '🇰🇷',
  hi: '🇮🇳',
  ar: '🇸🇦',
};

export interface LanguageSwitcherHandle {
  el: HTMLElement;
  dispose(): void;
}

/**
 * Topbar language override. Mirrors {@link themeSwitcher} but does NOT
 * persist the selection — the override lives in memory only and a hard
 * page reload restores the detected/persisted locale. That matches the
 * "override until next complete reload" UX.
 */
export function languageSwitcher(initial: LocaleCode): LanguageSwitcherHandle {
  let current = initial;

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.classList.add('dt-btn', 'dt-btn--ghost', 'dt-language-switcher');
  trigger.setAttribute('aria-label', translate('topbar.language.aria'));

  const flagSpan = document.createElement('span');
  flagSpan.classList.add('dt-language-switcher__flag');
  flagSpan.setAttribute('aria-hidden', 'true');
  flagSpan.textContent = FLAG[current];

  const codeSpan = document.createElement('span');
  codeSpan.classList.add('dt-language-switcher__code');
  codeSpan.textContent = current.toUpperCase();

  trigger.append(flagSpan, codeSpan, icon('chevronDown', { size: 12 }));

  const options: DropdownOption<LocaleCode>[] = LOCALES.map((l) => ({
    value: l.code,
    label: `${FLAG[l.code]}  ${l.nativeLabel}`,
    note: l.code.toUpperCase(),
  }));

  const wrap = document.createElement('span');
  wrap.appendChild(trigger);

  const handle: DropdownHandle = dropdown<LocaleCode>({
    trigger,
    options,
    value: current,
    onChange: (next) => {
      current = next;
      flagSpan.textContent = FLAG[next];
      codeSpan.textContent = next.toUpperCase();
      // Session-only override — persist=false so a hard reload reverts.
      setLocale(next, false);
    },
  });

  return {
    el: wrap,
    dispose() {
      handle.dispose();
    },
  };
}
