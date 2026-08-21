import { ProjectCard } from '@/components/ProjectCard';
import type { Locale, Project } from '@/lib/types';

const HEADING = { fr: 'Projets', en: 'Projects' };
const INTRO = {
  fr: 'Produits publics et mandats clients sélectionnés — chacun avec son contexte, ses décisions techniques et son résultat.',
  en: 'Public products and selected client engagements — each with its context, technical decisions, and outcome.',
};

export function ProjectsIndexPage({ locale, projects }: { locale: Locale; projects: Project[] }) {
  const detailHref = (project: Project) =>
    locale === 'fr' ? `/projets/${project.slug}` : `/en/projects/${project.slug}`;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold">{HEADING[locale]}</h1>
      <p className="mt-3 max-w-2xl text-slate-600">{INTRO[locale]}</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            locale={locale}
            href={detailHref(project)}
          />
        ))}
      </div>
    </div>
  );
}
