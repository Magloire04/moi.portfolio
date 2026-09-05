import type { LocalizedText } from '@/lib/types';

export interface LegalSection {
  id: string;
  heading: LocalizedText;
  body: LocalizedText;
}

// Hardcoded to the date this content was actually last revised, not the build
// date: a redeploy for an unrelated reason (a new project added, say) must not
// silently move this date forward without the wording itself having changed.
export const LEGAL_LAST_UPDATED: LocalizedText = {
  fr: '5 septembre 2026',
  en: 'September 5, 2026',
};

export const privacyPolicyIntro: LocalizedText = {
  fr: 'Cette page explique quelles données ce site collecte, pourquoi, et comment faire valoir vos droits.',
  en: 'This page explains what data this site collects, why, and how to exercise your rights.',
};

export const privacyPolicySections: LegalSection[] = [
  {
    id: 'controller',
    heading: { fr: 'Qui est responsable de ce site', en: 'Who is responsible for this site' },
    body: {
      fr: 'Ce site est édité par TECHNUM (Elisée Magloire Atonde), développeur indépendant basé au Bénin. Contact : elisee.atonde@bytechnum.com.',
      en: 'This site is published by TECHNUM (Elisée Magloire Atonde), an independent developer based in Benin. Contact: elisee.atonde@bytechnum.com.',
    },
  },
  {
    id: 'data-collected',
    heading: { fr: 'Données collectées', en: 'Data collected' },
    body: {
      fr: "La seule donnée personnelle collectée sur ce site provient du formulaire de contact : nom, adresse email, message, et projet d'intérêt si vous le renseignez. Aucune autre donnée n'est collectée : ce site n'utilise ni cookie, ni traceur, ni outil d'analyse d'audience.",
      en: 'The only personal data collected on this site comes from the contact form: name, email address, message, and project of interest if you provide one. No other data is collected: this site uses no cookies, no trackers, and no audience-analytics tool.',
    },
  },
  {
    id: 'purpose',
    heading: { fr: 'Pourquoi ces données sont collectées', en: 'Why this data is collected' },
    body: {
      fr: "Uniquement pour répondre à votre message. Aucune donnée du formulaire n'est utilisée à des fins commerciales, publicitaires, ou revendue à un tiers.",
      en: 'Solely to respond to your message. No form data is used for commercial or advertising purposes, or sold to any third party.',
    },
  },
  {
    id: 'recipients',
    heading: { fr: 'Qui y a accès', en: 'Who has access' },
    body: {
      fr: "TECHNUM est seul destinataire du contenu de votre message. L'envoi de la notification par email passe par le service Resend (hébergé dans l'Union européenne), qui agit uniquement comme sous-traitant technique d'acheminement.",
      en: 'TECHNUM is the sole recipient of your message. Delivery of the email notification goes through Resend (hosted in the European Union), acting solely as a technical delivery sub-processor.',
    },
  },
  {
    id: 'retention',
    heading: { fr: 'Durée de conservation', en: 'Retention period' },
    body: {
      fr: 'Les messages sont conservés le temps nécessaire pour traiter votre demande. Vous pouvez en demander la suppression à tout moment à l\'adresse ci-dessus.',
      en: 'Messages are kept for as long as needed to handle your request. You may request their deletion at any time at the address above.',
    },
  },
  {
    id: 'rights',
    heading: { fr: 'Vos droits', en: 'Your rights' },
    body: {
      fr: "Conformément à la loi béninoise n°2017-20 relative à la protection des données à caractère personnel, vous disposez d'un droit d'accès, de rectification, d'effacement et d'opposition sur vos données. Pour l'exercer, écrivez à elisee.atonde@bytechnum.com. Vous pouvez également saisir l'Autorité de Protection des Données à Caractère Personnel (APDP) du Bénin.",
      en: "Under Benin's law n°2017-20 on the protection of personal data, you have the right to access, rectify, erase, and object regarding your data. To exercise it, write to elisee.atonde@bytechnum.com. You may also file a complaint with Benin's Data Protection Authority (APDP).",
    },
  },
  {
    id: 'security',
    heading: { fr: 'Sécurité', en: 'Security' },
    body: {
      fr: 'Le site est servi entièrement en HTTPS. Le formulaire de contact est protégé par un piège à spam invisible (honeypot) qui ne collecte aucune donnée sur les visiteurs légitimes.',
      en: 'The site is served entirely over HTTPS. The contact form is protected by an invisible spam trap (honeypot) that collects no data from legitimate visitors.',
    },
  },
  {
    id: 'changes',
    heading: { fr: 'Modifications', en: 'Changes' },
    body: {
      fr: 'Cette politique peut être mise à jour ; la date en haut de page reflète la dernière révision.',
      en: 'This policy may be updated; the date at the top of the page reflects the latest revision.',
    },
  },
];

export const termsOfUseIntro: LocalizedText = {
  fr: 'Ces conditions régissent l\'utilisation du site moi.bytechnum.com.',
  en: 'These terms govern the use of the moi.bytechnum.com website.',
};

export const termsOfUseSections: LegalSection[] = [
  {
    id: 'publisher',
    heading: { fr: 'Éditeur du site', en: 'Site publisher' },
    body: {
      fr: 'Ce site est édité par TECHNUM (Elisée Magloire Atonde), développeur indépendant basé au Bénin. Contact : elisee.atonde@bytechnum.com. Hébergement : Spaceship.',
      en: 'This site is published by TECHNUM (Elisée Magloire Atonde), an independent developer based in Benin. Contact: elisee.atonde@bytechnum.com. Hosting: Spaceship.',
    },
  },
  {
    id: 'ip',
    heading: { fr: 'Propriété intellectuelle', en: 'Intellectual property' },
    body: {
      fr: "Les textes, visuels et la marque TECHNUM (y compris le logo) présentés sur ce site sont la propriété de TECHNUM, sauf mention contraire. Le code source de ce site est publié publiquement sur GitHub à titre de démonstration technique ; sa publication ne constitue pas une licence d'utilisation du contenu ou de la marque du site.",
      en: "The text, visuals, and TECHNUM brand (including the logo) shown on this site belong to TECHNUM, unless stated otherwise. This site's source code is published publicly on GitHub as a technical demonstration; that publication does not grant a license to the site's content or brand.",
    },
  },
  {
    id: 'projects-shown',
    heading: { fr: 'Projets présentés', en: 'Projects shown' },
    body: {
      fr: 'Les projets présentés dans la section Projets appartiennent à leurs propriétaires respectifs (produits TECHNUM, mandats clients, ou projets réalisés en équipe selon le cas indiqué sur chaque fiche). Les liens vers des démonstrations en ligne pointent vers des services tiers non exploités par TECHNUM.',
      en: 'The projects shown in the Projects section belong to their respective owners (TECHNUM products, client mandates, or team projects as indicated on each page). Links to live demos point to third-party services not operated by TECHNUM.',
    },
  },
  {
    id: 'availability',
    heading: { fr: 'Disponibilité', en: 'Availability' },
    body: {
      fr: 'Ce site est fourni "en l\'état", sans garantie de disponibilité continue ou d\'absence d\'erreur.',
      en: 'This site is provided "as is", with no guarantee of continuous availability or error-free operation.',
    },
  },
  {
    id: 'governing-law',
    heading: { fr: 'Droit applicable', en: 'Governing law' },
    body: {
      fr: 'Les présentes conditions sont soumises au droit béninois. Tout litige relève des juridictions compétentes du Bénin.',
      en: 'These terms are governed by the law of Benin. Any dispute falls under the competent courts of Benin.',
    },
  },
  {
    id: 'contact',
    heading: { fr: 'Contact', en: 'Contact' },
    body: {
      fr: 'Pour toute question sur ces conditions, écrivez à elisee.atonde@bytechnum.com.',
      en: 'For any question about these terms, write to elisee.atonde@bytechnum.com.',
    },
  },
];
