import type { Metadata } from 'next';
import { ContactPage } from '@/components/pages/ContactPage';
import { STATIC_PAGE_PATH_PAIRS, toLanguageAlternates } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with TECHNUM about a web application, APDP compliance, or digital-certification project.',
  alternates: toLanguageAlternates(STATIC_PAGE_PATH_PAIRS.contact),
};

export default function ContactRoute() {
  return <ContactPage locale="en" />;
}
