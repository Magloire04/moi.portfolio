import type { Metadata } from 'next';
import { PrivacyPolicyPage } from '@/components/pages/PrivacyPolicyPage';
import { STATIC_PAGE_PATH_PAIRS, toLanguageAlternates } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'What data this site collects and how to exercise your rights.',
  alternates: toLanguageAlternates(STATIC_PAGE_PATH_PAIRS.privacyPolicy),
};

export default function PrivacyPolicyRoute() {
  return <PrivacyPolicyPage locale="en" />;
}
