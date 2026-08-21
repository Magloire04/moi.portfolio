import type { Metadata } from 'next';
import { ContactPage } from '@/components/pages/ContactPage';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with ByTechnum about a web application, APDP compliance, or digital-certification project.',
};

export default function ContactRoute() {
  return <ContactPage locale="en" />;
}
