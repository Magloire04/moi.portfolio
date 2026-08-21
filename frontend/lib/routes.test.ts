import { describe, expect, it } from 'vitest';
import { getAlternateHref } from './routes';

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
