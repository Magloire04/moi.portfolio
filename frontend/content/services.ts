import type { LocalizedText } from '@/lib/types';

export interface Service {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
}

export const services: Service[] = [
  {
    id: 'web-applications',
    title: { fr: 'Applications web sur-mesure', en: 'Custom web applications' },
    description: {
      fr: "Sites vitrines, CMS et applications de gestion (caisse, attestations, pointage) développés en Laravel/PHP ou React/TypeScript, adaptés au métier réel de votre structure plutôt qu'à un gabarit générique.",
      en: 'Corporate sites, content-managed platforms, and business-management applications (cash handling, certificates, attendance) built in Laravel/PHP or React/TypeScript, shaped around how your organization actually works.',
    },
  },
  {
    id: 'progressive-web-apps',
    title: { fr: 'Applications web progressives (PWA)', en: 'Progressive web apps' },
    description: {
      fr: 'Applications installables, utilisables hors-ligne, pensées pour des contextes de connexion instable : un standard technique appliqué à chaque produit TECHNUM public.',
      en: 'Installable, offline-capable applications built for unreliable connectivity: a technical standard applied to every public TECHNUM product.',
    },
  },
  {
    id: 'data-compliance',
    title: { fr: 'Conformité données personnelles (APDP)', en: 'Data-protection compliance (APDP)' },
    description: {
      fr: "Traitement des données personnelles conforme à la loi béninoise n°2017-20 (APDP) : minimisation des champs, consentement explicite, cité et appliqué dans plusieurs projets en production.",
      en: "Personal-data handling aligned with Benin's data-protection law (n°2017-20, APDP): field minimization, explicit consent, applied and cited across several production projects.",
    },
  },
  {
    id: 'digital-certification',
    title: { fr: 'Certification numérique & traçabilité', en: 'Digital certification & traceability' },
    description: {
      fr: 'Signature cryptographique réelle (ECDSA), vérification publique par QR code, pour rendre une chaîne de production ou une transaction vérifiable sans base de données centrale interrogeable.',
      en: 'Real cryptographic signing (ECDSA), public QR-code verification: making a production chain or a transaction verifiable without exposing a queryable central database.',
    },
  },
  {
    id: 'digital-identity',
    title: { fr: 'Identité numérique', en: 'Digital identity' },
    description: {
      fr: "Preuves de concept et intégrations autour de l'identité décentralisée (standards W3C Verifiable Credentials, infrastructure MOSIP), pour des acteurs institutionnels qui évaluent ces technologies.",
      en: 'Proofs of concept and integrations around decentralized identity (W3C Verifiable Credentials standards, MOSIP infrastructure), for institutional actors evaluating these technologies.',
    },
  },
  {
    id: 'admin-backoffice',
    title: { fr: "Back-office & tableaux de bord d'administration", en: 'Admin back-offices & dashboards' },
    description: {
      fr: "Interfaces d'administration complètes (Filament/Laravel) pour gérer du contenu, suivre des statistiques, traiter des demandes, sans dépendre de vous pour chaque mise à jour.",
      en: 'Full admin interfaces (Filament/Laravel) to manage content, track statistics, and process requests, without needing a developer for every routine update.',
    },
  },
];
