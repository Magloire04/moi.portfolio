import type { Locale } from './types';

/** Production origin for the static export (see docs/superpowers/specs — `moi.bytechnum.com`). */
export const SITE_URL = 'https://moi.bytechnum.com';

const FR_TO_EN_SEGMENT: Record<string, string> = {
  services: 'services',
  projets: 'projects',
  'a-propos': 'about',
  contact: 'contact',
};

const EN_TO_FR_SEGMENT: Record<string, string> = {
  services: 'services',
  projects: 'projets',
  about: 'a-propos',
  contact: 'contact',
};

export function getAlternateHref(pathname: string, locale: Locale): string {
  const segments = pathname.split('/').filter(Boolean);

  if (locale === 'fr') {
    const [first, ...rest] = segments;
    const enFirst = first ? (FR_TO_EN_SEGMENT[first] ?? first) : undefined;
    const tail = [enFirst, ...rest].filter(Boolean).join('/');
    return tail ? `/en/${tail}` : '/en';
  }

  const [, first, ...rest] = segments; // segments[0] is always 'en'
  const frFirst = first ? (EN_TO_FR_SEGMENT[first] ?? first) : undefined;
  const tail = [frFirst, ...rest].filter(Boolean).join('/');
  return tail ? `/${tail}` : '/';
}
