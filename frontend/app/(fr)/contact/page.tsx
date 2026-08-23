import type { Metadata } from 'next';
import { ContactPage } from '@/components/pages/ContactPage';
import { STATIC_PAGE_PATH_PAIRS, toLanguageAlternates } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    "Contactez TECHNUM pour un projet d'application web, de conformité APDP ou de certification numérique.",
  alternates: toLanguageAlternates(STATIC_PAGE_PATH_PAIRS.contact),
};

export default function ContactRoute() {
  return <ContactPage locale="fr" />;
}
