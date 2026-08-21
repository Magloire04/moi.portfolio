import type { Metadata } from 'next';
import { AboutPage } from '@/components/pages/AboutPage';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Full-stack developer based in Benin — pull-request workflow, APDP compliance, and applied cryptography.',
};

export default function AboutRoute() {
  return <AboutPage locale="en" />;
}
