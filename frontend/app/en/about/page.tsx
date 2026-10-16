import type { Metadata } from 'next';
import { AboutPage } from '@/components/pages/AboutPage';
import { STATIC_PAGE_PATH_PAIRS, toLanguageAlternates } from '@/lib/routes';
import { getProjects, getSettings } from '@/lib/api';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Full-stack developer based in Benin: pull-request workflow, APDP compliance, and applied cryptography.',
  alternates: toLanguageAlternates(STATIC_PAGE_PATH_PAIRS.about),
};

export default async function AboutRoute() {
  const [{ data: projects }, settings] = await Promise.all([
    getProjects({ limit: 100 }),
    getSettings(),
  ]);

  return <AboutPage locale="en" settings={settings} projectCount={projects.filter((p) => p.featured).length} />;
}
