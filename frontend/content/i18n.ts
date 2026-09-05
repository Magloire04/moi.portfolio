import type { Locale } from '@/lib/types';

export interface Dictionary {
  nav: {
    home: string;
    services: string;
    projects: string;
    about: string;
    contact: string;
  };
  footer: {
    rights: string;
    availableForWork: string;
    notAvailableForWork: string;
  };
  cta: {
    contactMe: string;
    viewProject: string;
    liveDemo: string;
  };
  notFound: {
    title: string;
    body: string;
    backHome: string;
  };
  legal: {
    privacyPolicy: string;
    termsOfUse: string;
  };
}

const dictionaries: Record<Locale, Dictionary> = {
  fr: {
    nav: {
      home: 'Accueil',
      services: 'Services',
      projects: 'Projets',
      about: 'À propos',
      contact: 'Contact',
    },
    footer: {
      rights: 'Tous droits réservés.',
      availableForWork: 'Disponible pour de nouveaux mandats',
      notAvailableForWork: 'Actuellement complet',
    },
    cta: {
      contactMe: 'Me contacter',
      viewProject: 'Voir le projet',
      liveDemo: 'Démo en ligne',
    },
    notFound: {
      title: 'Page introuvable',
      body: "La page que vous cherchez n'existe pas ou plus.",
      backHome: "Retour à l'accueil",
    },
    legal: {
      privacyPolicy: 'Politique de confidentialité',
      termsOfUse: "Conditions d'utilisation",
    },
  },
  en: {
    nav: {
      home: 'Home',
      services: 'Services',
      projects: 'Projects',
      about: 'About',
      contact: 'Contact',
    },
    footer: {
      rights: 'All rights reserved.',
      availableForWork: 'Available for new engagements',
      notAvailableForWork: 'Currently fully booked',
    },
    cta: {
      contactMe: 'Get in touch',
      viewProject: 'View project',
      liveDemo: 'Live demo',
    },
    notFound: {
      title: 'Page not found',
      body: "The page you're looking for doesn't exist.",
      backHome: 'Back to home',
    },
    legal: {
      privacyPolicy: 'Privacy Policy',
      termsOfUse: 'Terms of Use',
    },
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
