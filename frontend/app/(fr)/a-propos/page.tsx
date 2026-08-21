import type { Metadata } from 'next';
import { AboutPage } from '@/components/pages/AboutPage';

export const metadata: Metadata = {
  title: 'À propos',
  description:
    'Développeur full-stack basé au Bénin, méthodologie par pull request, conformité APDP et cryptographie appliquée.',
};

export default function AProposRoute() {
  return <AboutPage locale="fr" />;
}
