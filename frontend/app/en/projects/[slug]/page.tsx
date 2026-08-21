import type { Metadata } from 'next';
import { ProjectDetailPage } from '@/components/pages/ProjectDetailPage';
import { getProject, getProjects } from '@/lib/api';
import { getProjectPathPair, toLanguageAlternates } from '@/lib/routes';

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
    title: project.title.en,
    description: project.tagline.en,
    alternates: toLanguageAlternates(getProjectPathPair(slug)),
  };
}

export default async function ProjectDetailRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);

  return <ProjectDetailPage locale="en" project={project} />;
}
