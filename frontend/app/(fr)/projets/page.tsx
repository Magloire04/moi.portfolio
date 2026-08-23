import type { Metadata } from 'next';
import { ProjectsIndexPage } from '@/components/pages/ProjectsIndexPage';
import { getProjects } from '@/lib/api';
import { STATIC_PAGE_PATH_PAIRS, toLanguageAlternates } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Projets',
  description:
    "Études de cas de projets TECHNUM : produits internes et mandats clients, du POC d'identité numérique aux applications de gestion en production.",
  alternates: toLanguageAlternates(STATIC_PAGE_PATH_PAIRS.projects),
};

export default async function ProjetsRoute() {
  const { data: projects } = await getProjects({ limit: 100 });

  return <ProjectsIndexPage locale="fr" projects={projects} />;
}
