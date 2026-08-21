import type { Metadata } from 'next';
import { ProjectsIndexPage } from '@/components/pages/ProjectsIndexPage';
import { getProjects } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Projets',
  description:
    "Études de cas de projets ByTechnum : produits internes et mandats clients, du POC d'identité numérique aux applications de gestion en production.",
};

export default async function ProjetsRoute() {
  const { data: projects } = await getProjects({ limit: 100 });

  return <ProjectsIndexPage locale="fr" projects={projects} />;
}
