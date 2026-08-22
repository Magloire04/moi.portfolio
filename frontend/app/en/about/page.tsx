import type { Metadata } from 'next';
import { AboutPage } from '@/components/pages/AboutPage';
import { STATIC_PAGE_PATH_PAIRS, toLanguageAlternates } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Full-stack developer based in Benin: pull-request workflow, APDP compliance, and applied cryptography.',
  alternates: toLanguageAlternates(STATIC_PAGE_PATH_PAIRS.about),
};

export default function AboutRoute() {
  return <AboutPage locale="en" />;
}
