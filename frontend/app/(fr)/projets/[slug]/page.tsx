import type { Metadata } from 'next';
import { ProjectDetailPage } from '@/components/pages/ProjectDetailPage';
import { getProject, getProjects } from '@/lib/api';

export async function generateStaticParams() {
  const { data: projects } = await getProjects({ limit: 100 });
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  return {
    title: project.title.fr,
    description: project.tagline.fr,
  };
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
