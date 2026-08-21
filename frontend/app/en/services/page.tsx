import type { Metadata } from 'next';
import { ServicesPage } from '@/components/pages/ServicesPage';
import { STATIC_PAGE_PATH_PAIRS, toLanguageAlternates } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Custom web applications, PWAs, APDP compliance, digital certification, and admin back-offices — the services offered under the ByTechnum brand.',
  alternates: toLanguageAlternates(STATIC_PAGE_PATH_PAIRS.services),
};

export default function ServicesRoute() {
  return <ServicesPage locale="en" />;
}
