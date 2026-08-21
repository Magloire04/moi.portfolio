import Link from 'next/link';
import { ProjectCard } from '@/components/ProjectCard';
import { getDictionary } from '@/content/i18n';
import type { Locale, Project, Settings } from '@/lib/types';

const STACK_HIGHLIGHTS = ['Laravel', 'PHP', 'React', 'TypeScript', 'Spring Boot', 'PWA'];

const COPY = {
  fr: {
    heroKicker: 'Développeur full-stack — Bénin 🇧🇯',
    heroHeadline: "Je construis des applications qu'on peut auditer, pas juste qu'on peut démontrer.",
    heroBody:
      "ByTechnum conçoit des applications web sur-mesure pour des clients institutionnels et privés en Afrique de l'Ouest : gestion, identité numérique, traçabilité, conformité APDP.",
    featuredHeading: 'Projets phares',
    methodHeading: 'Une méthode, pas juste du code',
    methodBody:
      "Workflow par pull request même en solo, tests automatisés, en-têtes de sécurité stricts, conformité à la loi béninoise sur les données personnelles (APDP) citée explicitement dans plusieurs projets.",
    contactHref: '/contact',
    projectsHref: '/projets',
    viewAllProjects: 'Voir tous les projets',
  },
  en: {
    heroKicker: 'Full-stack developer — Benin 🇧🇯',
    heroHeadline: 'I build applications you can audit, not just ones you can demo.',
    heroBody:
      'ByTechnum builds custom web applications for institutional and private clients across West Africa: management systems, digital identity, traceability, data-protection compliance.',
    featuredHeading: 'Featured projects',
    methodHeading: 'A method, not just code',
    methodBody:
      'Pull-request workflow even solo, automated tests, strict security headers, compliance with Benin’s data-protection law (APDP) explicitly cited across several projects.',
    contactHref: '/en/contact',
    projectsHref: '/en/projects',
    viewAllProjects: 'View all projects',
  },
} as const;

export function HomePage({
  locale,
  featuredProjects,
  settings,
}: {
  locale: Locale;
  featuredProjects: Project[];
  settings: Settings;
}) {
  const dictionary = getDictionary(locale);
  const copy = COPY[locale];
  const projectHref = (project: Project) =>
    locale === 'fr' ? `/projets/${project.slug}` : `/en/projects/${project.slug}`;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <section>
        <p className="font-mono text-sm uppercase tracking-wide text-slate-500">{copy.heroKicker}</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight">{copy.heroHeadline}</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">{copy.heroBody}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link href={copy.contactHref} className="rounded bg-slate-900 px-5 py-2.5 text-white">
            {dictionary.cta.contactMe}
          </Link>
          <p className="text-sm text-slate-600">
            {settings.availableForWork
              ? dictionary.footer.availableForWork
              : dictionary.footer.notAvailableForWork}
          </p>
        </div>
      </section>

      <section className="mt-12 flex flex-wrap gap-2">
        {STACK_HIGHLIGHTS.map((technology) => (
          <span
            key={technology}
            className="rounded-full border border-slate-300 px-3 py-1 font-mono text-xs"
          >
            {technology}
          </span>
        ))}
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold">{copy.featuredHeading}</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {featuredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              locale={locale}
              href={projectHref(project)}
            />
          ))}
        </div>
        <Link href={copy.projectsHref} className="mt-6 inline-block underline">
          {copy.viewAllProjects}
        </Link>
      </section>

      <section className="mt-16 rounded-lg bg-slate-50 p-8">
        <h2 className="text-2xl font-semibold">{copy.methodHeading}</h2>
        <p className="mt-3 max-w-2xl text-slate-600">{copy.methodBody}</p>
      </section>
    </div>
  );
}
