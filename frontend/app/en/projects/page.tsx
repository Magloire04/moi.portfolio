import type { Metadata } from 'next';
import { ProjectsIndexPage } from '@/components/pages/ProjectsIndexPage';
import { getProjects } from '@/lib/api';
import { STATIC_PAGE_PATH_PAIRS, toLanguageAlternates } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Case studies from ByTechnum: in-house products and client mandates, from a digital-identity PoC to production management applications.',
  alternates: toLanguageAlternates(STATIC_PAGE_PATH_PAIRS.projects),
};

export default async function ProjectsRoute() {
  const { data: projects } = await getProjects({ limit: 100 });

  return <ProjectsIndexPage locale="en" projects={projects} />;
}
