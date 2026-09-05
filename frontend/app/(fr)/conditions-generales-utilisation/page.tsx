import type { Metadata } from 'next';
import { TermsOfUsePage } from '@/components/pages/TermsOfUsePage';
import { STATIC_PAGE_PATH_PAIRS, toLanguageAlternates } from '@/lib/routes';

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description: "Les conditions qui régissent l'utilisation de ce site.",
  alternates: toLanguageAlternates(STATIC_PAGE_PATH_PAIRS.termsOfUse),
};

export default function TermsOfUseRoute() {
  return <TermsOfUsePage locale="fr" />;
}
