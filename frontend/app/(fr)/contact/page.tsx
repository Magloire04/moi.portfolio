import type { Metadata } from 'next';
import { ContactPage } from '@/components/pages/ContactPage';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    "Contactez ByTechnum pour un projet d'application web, de conformité APDP ou de certification numérique.",
};

export default function ContactRoute() {
  return <ContactPage locale="fr" />;
}
