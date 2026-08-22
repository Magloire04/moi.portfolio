import type { LocalizedText } from '@/lib/types';

/**
 * Static, authored facts for the homepage's "proof strip" — same pattern as
 * content/about.ts and content/services.ts. The product count is passed in
 * separately by HomePage (derived from real featured-project data instead
 * of being hardcoded here), everything else here is a fact that doesn't
 * change with the project list.
 */
export const proofPoints: LocalizedText[] = [
  {
    fr: '222 tests automatisés',
    en: '222 automated tests',
  },
  {
    fr: 'ECDSA P-384 · Argon2id',
    en: 'ECDSA P-384 · Argon2id',
  },
  {
    fr: 'Conformité APDP',
    en: 'APDP compliance',
  },
];
