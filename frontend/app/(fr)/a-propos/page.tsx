import type { Metadata } from 'next';
import { AboutPage } from '@/components/pages/AboutPage';
import { STATIC_PAGE_PATH_PAIRS, toLanguageAlternates } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'À propos',
  description:
    'Développeur full-stack basé au Bénin, méthodologie par pull request, conformité APDP et cryptographie appliquée.',
  alternates: toLanguageAlternates(STATIC_PAGE_PATH_PAIRS.about),
};

export default function AProposRoute() {
  return <AboutPage locale="fr" />;
}
