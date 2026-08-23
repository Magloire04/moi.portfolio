import Link from 'next/link';
import { FeaturedProjectShowcase } from '@/components/FeaturedProjectShowcase';
import { proofPoints } from '@/content/proof';
import { methodPoints } from '@/content/about';
import { getDictionary } from '@/content/i18n';
import type { Locale, Project, Settings } from '@/lib/types';

const COPY = {
  fr: {
    heroKicker: 'TECHNUM · Développeur full-stack · Bénin',
    heroHeadline: "Je construis des applications qu'on peut auditer, pas juste qu'on peut démontrer.",
    heroBody:
      "TECHNUM conçoit des applications web sur-mesure pour des clients institutionnels et privés en Afrique de l'Ouest : gestion, identité numérique, traçabilité, conformité APDP.",
    featuredHeading: 'Projets phares',
    methodHeading: 'Une méthode, pas juste du code',
    contactHref: '/contact',
    projectsHref: '/projets',
    viewAllProjects: 'Voir tous les projets ↗',
    productsInProduction: (n: number) => `${n} produits en production`,
  },
  en: {
    heroKicker: 'TECHNUM · Full-stack developer · Benin',
    heroHeadline: 'I build applications you can audit, not just ones you can demo.',
    heroBody:
      'TECHNUM builds custom web applications for institutional and private clients across West Africa: management systems, digital identity, traceability, data-protection compliance.',
    featuredHeading: 'Featured projects',
    methodHeading: 'A method, not just code',
    contactHref: '/en/contact',
    projectsHref: '/en/projects',
    viewAllProjects: 'View all projects ↗',
    productsInProduction: (n: number) => `${n} products in production`,
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

  const ledger = [copy.productsInProduction(featuredProjects.length), ...proofPoints.map((p) => p[locale])];

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <section>
        <p className="font-mono text-xs uppercase tracking-wide text-slate">{copy.heroKicker}</p>
        <h1 className="mt-4 max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.1] sm:text-5xl">
          {copy.heroHeadline}
        </h1>
        <p className="mt-5 max-w-xl text-lg text-slate">{copy.heroBody}</p>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <Link
            href={copy.contactHref}
            className="rounded-full bg-signet px-5 py-2.5 font-medium text-paper transition-opacity hover:opacity-90"
          >
            {dictionary.cta.contactMe}
          </Link>
          <p className="flex items-center gap-2 text-sm text-slate">
            <span
              aria-hidden="true"
              className={`inline-block h-2 w-2 rounded-full ${settings.availableForWork ? 'bg-signet' : 'bg-slate'}`}
            />
            {settings.availableForWork
              ? dictionary.footer.availableForWork
              : dictionary.footer.notAvailableForWork}
          </p>
        </div>
      </section>

      <section className="mt-14 flex flex-wrap gap-x-6 gap-y-3 border-y border-mist py-4 font-mono text-xs text-slate">
        {ledger.map((fact, index) => (
          <span key={fact} className="flex items-center gap-6">
            {fact}
            {index < ledger.length - 1 && <span aria-hidden="true" className="hidden h-3 w-px bg-mist sm:inline-block" />}
          </span>
        ))}
      </section>

      <section className="mt-20">
        <h2 className="font-display text-2xl font-semibold">{copy.featuredHeading}</h2>
        <div className="mt-8 flex flex-col gap-16">
          {featuredProjects.map((project) => (
            <FeaturedProjectShowcase
              key={project.id}
              project={project}
              locale={locale}
              href={projectHref(project)}
            />
          ))}
        </div>
        <Link href={copy.projectsHref} className="mt-10 inline-block font-mono text-sm text-signet hover:underline">
          {copy.viewAllProjects}
        </Link>
      </section>

      <section className="mt-20">
        <h2 className="font-display text-2xl font-semibold">{copy.methodHeading}</h2>
        <ol className="mt-8 grid gap-8 sm:grid-cols-2">
          {methodPoints.map((point, index) => (
            <li key={point.id} className="flex gap-4">
              <span className="font-mono text-sm text-slate">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="font-medium">{point.title[locale]}</h3>
                <p className="mt-1 text-sm text-slate">{point.body[locale]}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
