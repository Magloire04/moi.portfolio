import { ProjectsIndexPage } from '@/components/pages/ProjectsIndexPage';
import { getProjects } from '@/lib/api';

export default async function ProjetsRoute() {
  const { data: projects } = await getProjects();

  return <ProjectsIndexPage locale="fr" projects={projects} />;
}
