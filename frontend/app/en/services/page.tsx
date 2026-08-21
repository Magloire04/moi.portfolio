import type { Metadata } from 'next';
import { ServicesPage } from '@/components/pages/ServicesPage';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Custom web applications, PWAs, APDP compliance, digital certification, and admin back-offices — the services offered under the ByTechnum brand.',
};

export default function ServicesRoute() {
  return <ServicesPage locale="en" />;
}
