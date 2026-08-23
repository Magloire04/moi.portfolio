import type { Metadata } from 'next';
import { ServicesPage } from '@/components/pages/ServicesPage';
import { STATIC_PAGE_PATH_PAIRS, toLanguageAlternates } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Applications web sur-mesure, PWA, conformité APDP, certification numérique et back-office : les services proposés sous la marque TECHNUM.',
  alternates: toLanguageAlternates(STATIC_PAGE_PATH_PAIRS.services),
};

export default function ServicesRoute() {
  return <ServicesPage locale="fr" />;
}
