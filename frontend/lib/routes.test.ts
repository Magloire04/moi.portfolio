import { describe, expect, it } from 'vitest';
import {
  getAlternateHref,
  getProjectPathPair,
  SITE_URL,
  STATIC_PAGE_PATH_PAIRS,
  toLanguageAlternates,
} from './routes';

describe('getAlternateHref', () => {
  it('maps the FR home page to the EN home page', () => {
    expect(getAlternateHref('/', 'fr')).toBe('/en');
  });

  it('maps the EN home page to the FR home page', () => {
    expect(getAlternateHref('/en', 'en')).toBe('/');
  });

  it('translates static FR segments to their EN equivalents', () => {
    expect(getAlternateHref('/projets', 'fr')).toBe('/en/projects');
    expect(getAlternateHref('/a-propos', 'fr')).toBe('/en/about');
    expect(getAlternateHref('/services', 'fr')).toBe('/en/services');
    expect(getAlternateHref('/contact', 'fr')).toBe('/en/contact');
  });

  it('translates static EN segments back to their FR equivalents', () => {
    expect(getAlternateHref('/en/projects', 'en')).toBe('/projets');
    expect(getAlternateHref('/en/about', 'en')).toBe('/a-propos');
  });

  it('preserves a shared slug on project detail pages', () => {
    expect(getAlternateHref('/projets/tracacajou', 'fr')).toBe('/en/projects/tracacajou');
    expect(getAlternateHref('/en/projects/tracacajou', 'en')).toBe('/projets/tracacajou');
  });
});

describe('getProjectPathPair', () => {
  it('builds the FR and EN detail paths for a shared slug', () => {
    expect(getProjectPathPair('tracacajou')).toEqual({
      fr: '/projets/tracacajou/',
      en: '/en/projects/tracacajou/',
    });
  });
});

describe('toLanguageAlternates', () => {
  it('prefixes both paths in a pair with SITE_URL', () => {
    expect(toLanguageAlternates({ fr: '/services/', en: '/en/services/' })).toEqual({
      languages: {
        fr: `${SITE_URL}/services/`,
        en: `${SITE_URL}/en/services/`,
      },
    });
  });

  it('matches STATIC_PAGE_PATH_PAIRS for every static page (the same pairs sitemap.ts consumes)', () => {
    for (const pair of Object.values(STATIC_PAGE_PATH_PAIRS)) {
      const alternates = toLanguageAlternates(pair);
      expect(alternates.languages.fr).toBe(`${SITE_URL}${pair.fr}`);
      expect(alternates.languages.en).toBe(`${SITE_URL}${pair.en}`);
      // Every page's own alternates must point at ITS OWN translated page, not the
      // home page pair — this is precisely the regression a whole-branch review
      // caught: a page inheriting the root layout's home-page alternates verbatim.
      if (pair !== STATIC_PAGE_PATH_PAIRS.home) {
        expect(alternates.languages).not.toEqual(
          toLanguageAlternates(STATIC_PAGE_PATH_PAIRS.home).languages,
        );
      }
    }
  });

  it('builds a correct pair for a project detail page, distinct from the home page pair', () => {
    const projectAlternates = toLanguageAlternates(getProjectPathPair('tracacajou'));
    const homeAlternates = toLanguageAlternates(STATIC_PAGE_PATH_PAIRS.home);

    expect(projectAlternates.languages.fr).toBe(`${SITE_URL}/projets/tracacajou/`);
    expect(projectAlternates.languages.en).toBe(`${SITE_URL}/en/projects/tracacajou/`);
    expect(projectAlternates.languages).not.toEqual(homeAlternates.languages);
  });
});
