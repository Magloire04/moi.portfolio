import type { LocalizedText } from '@/lib/types';

export interface MethodPoint {
  id: string;
  title: LocalizedText;
  body: LocalizedText;
}

export const bio: LocalizedText = {
  fr: "Je suis développeur full-stack, basé au Bénin, et je conçois des applications pour des clients institutionnels et privés en Afrique de l'Ouest sous la marque ByTechnum. Mon terrain de jeu principal est Laravel/PHP, avec une bascule récente vers React et TypeScript pour les produits les plus récents : Dis oui, TraçaCajou, l'estimateur de bourse « where ». Je m'intéresse particulièrement aux projets qui touchent à l'infrastructure : identité numérique décentralisée, certification cryptographique, paiements de masse.",
  en: "I'm a full-stack developer based in Benin, building applications for institutional and private clients across West Africa under the ByTechnum brand. My core stack is Laravel/PHP, with a recent shift to React and TypeScript for the newest products: Dis oui, TraçaCajou, the \"where\" scholarship estimator. I'm especially drawn to infrastructure-adjacent work: decentralized digital identity, cryptographic certification, mass payments.",
};

export const methodPoints: MethodPoint[] = [
  {
    id: 'pr-workflow',
    title: { fr: 'Workflow par pull request, même en solo', en: 'Pull-request workflow, even solo' },
    body: {
      fr: 'Chaque changement passe par une issue, une branche, une PR et une relecture, sur ce portfolio comme sur mes mandats clients. Ça laisse une trace de décision, pas seulement du code.',
      en: 'Every change goes through an issue, a branch, a PR, and a review, on this portfolio the same as on client work. It leaves a decision trail, not just code.',
    },
  },
  {
    id: 'apdp',
    title: { fr: 'Conformité APDP citée explicitement', en: 'APDP compliance, explicitly cited' },
    body: {
      fr: "La loi béninoise n°2017-20 sur la protection des données personnelles est nommée et appliquée dans plusieurs projets en production, pas traitée comme un détail administratif après coup.",
      en: "Benin's data-protection law (n°2017-20, APDP) is named and applied across several production projects, not treated as an administrative afterthought.",
    },
  },
  {
    id: 'real-crypto',
    title: { fr: 'Cryptographie appliquée, pas décorative', en: 'Applied cryptography, not decorative' },
    body: {
      fr: 'Signatures ECDSA P-384 réelles pour des certificats vérifiables publiquement, JWT signés pour un PoC d\'identité numérique, Argon2id pour les mots de passe : la sécurité vit dans le code, pas dans une brochure.',
      en: 'Real ECDSA P-384 signatures for publicly verifiable certificates, signed JWTs for a digital-identity PoC, Argon2id for passwords: security lives in the code, not in a brochure.',
    },
  },
  {
    id: 'tests-ci',
    title: { fr: 'Tests et intégration continue', en: 'Tests and continuous integration' },
    body: {
      fr: 'Suites de tests automatisées et scan de secrets sur chaque changement, y compris sur ce site, dont le code est public.',
      en: 'Automated test suites and secret scanning on every change, including this site, whose code is public.',
    },
  },
];
