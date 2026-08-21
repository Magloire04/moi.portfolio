import type { Locale } from './types';

/** Production origin for the static export (see docs/superpowers/specs — `moi.bytechnum.com`). */
export const SITE_URL = 'https://moi.bytechnum.com';

/**
 * Single source of truth for every static (non-project) page's FR/EN path pair.
 * Mirrors the FR_HREFS / EN_HREFS pairs in components/layout/Header.tsx. Trailing
 * slashes match the actual static-export output (next.config.ts sets
 * `trailingSlash: true`), so these are the canonical, redirect-free paths.
 *
 * Used both by app/sitemap.ts (to build sitemap entries) and by each leaf page's
 * `alternates.languages` metadata, so the two can never drift apart.
 */
export const STATIC_PAGE_PATH_PAIRS = {
  home: { fr: '/', en: '/en/' },
  services: { fr: '/services/', en: '/en/services/' },
  projects: { fr: '/projets/', en: '/en/projects/' },
  about: { fr: '/a-propos/', en: '/en/about/' },
  contact: { fr: '/contact/', en: '/en/contact/' },
} as const satisfies Record<string, { fr: string; en: string }>;

/** The FR/EN path pair for a given project detail page, keyed by its shared slug. */
export function getProjectPathPair(slug: string): { fr: string; en: string } {
  return { fr: `/projets/${slug}/`, en: `/en/projects/${slug}/` };
}

/**
 * Turns a relative FR/EN path pair into an absolute `alternates.languages` value
 * for the Metadata API, using the same SITE_URL every other absolute-URL metadata
 * field (metadataBase, sitemap.ts, robots.ts) is built from.
 */
export function toLanguageAlternates(pair: { fr: string; en: string }): {
  languages: { fr: string; en: string };
} {
  return {
    languages: {
      fr: `${SITE_URL}${pair.fr}`,
      en: `${SITE_URL}${pair.en}`,
    },
  };
}

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
