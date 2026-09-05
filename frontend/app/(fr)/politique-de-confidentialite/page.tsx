import type { Metadata } from 'next';
import { PrivacyPolicyPage } from '@/components/pages/PrivacyPolicyPage';
import { STATIC_PAGE_PATH_PAIRS, toLanguageAlternates } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Quelles données ce site collecte et comment faire valoir vos droits.',
  alternates: toLanguageAlternates(STATIC_PAGE_PATH_PAIRS.privacyPolicy),
};

export default function PrivacyPolicyRoute() {
  return <PrivacyPolicyPage locale="fr" />;
}
