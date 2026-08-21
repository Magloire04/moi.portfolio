import { ProjectsIndexPage } from '@/components/pages/ProjectsIndexPage';
import { getProjects } from '@/lib/api';

export default async function ProjectsRoute() {
  const { data: projects } = await getProjects();

  return <ProjectsIndexPage locale="en" projects={projects} />;
}
