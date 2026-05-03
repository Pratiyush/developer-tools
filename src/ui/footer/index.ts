import { translate } from '../../lib/i18n';

export interface FooterHandle {
  el: HTMLElement;
}

const REPO_URL = 'https://github.com/Pratiyush/developer-tools';

const LINKS: {
  key:
    | 'footer.privacy'
    | 'footer.disclaimer'
    | 'footer.license'
    | 'footer.security'
    | 'footer.repo';
  href: string;
}[] = [
  { key: 'footer.privacy', href: `${REPO_URL}/blob/main/PRIVACY.md` },
  { key: 'footer.disclaimer', href: `${REPO_URL}/blob/main/DISCLAIMER.md` },
  { key: 'footer.security', href: `${REPO_URL}/blob/main/SECURITY.md` },
  { key: 'footer.license', href: `${REPO_URL}/blob/main/LICENSE` },
  { key: 'footer.repo', href: REPO_URL },
];

export function footer(): FooterHandle {
  const el = document.createElement('footer');
  el.classList.add('dt-footer');

  const copyright = document.createElement('p');
  copyright.classList.add('dt-footer__copy');
  copyright.textContent = translate('site.copyright');

  const links = document.createElement('nav');
  links.classList.add('dt-footer__links');
  links.setAttribute('aria-label', 'Site links');

  for (const link of LINKS) {
    const a = document.createElement('a');
    a.href = link.href;
    a.target = '_blank';
    a.rel = 'noreferrer noopener';
    a.textContent = translate(link.key);
    links.appendChild(a);
  }

  el.append(copyright, links);
  return { el };
}
