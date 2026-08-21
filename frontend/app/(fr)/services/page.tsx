import type { Metadata } from 'next';
import { ServicesPage } from '@/components/pages/ServicesPage';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Applications web sur-mesure, PWA, conformité APDP, certification numérique et back-office — les services proposés sous la marque ByTechnum.',
};

export default function ServicesRoute() {
  return <ServicesPage locale="fr" />;
}
