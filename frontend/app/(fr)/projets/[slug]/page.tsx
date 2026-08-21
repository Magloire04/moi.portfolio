import { ProjectDetailPage } from '@/components/pages/ProjectDetailPage';
import { getProject, getProjects } from '@/lib/api';

export async function generateStaticParams() {
  const { data: projects } = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjetDetailRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);

  return <ProjectDetailPage locale="fr" project={project} />;
}
