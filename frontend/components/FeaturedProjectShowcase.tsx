import Image from 'next/image';
import Link from 'next/link';
import { getScreenshotUrl } from '@/lib/api';
import { getProjectAccent } from '@/lib/accent';
import { getDictionary } from '@/content/i18n';
import type { Locale, Project } from '@/lib/types';

const SOURCE_LABEL = { fr: 'Code source', en: 'Source code' };

export function FeaturedProjectShowcase({
  project,
  locale,
  href,
}: {
  project: Project;
  locale: Locale;
  href: string;
}) {
  const dictionary = getDictionary(locale);
  const accent = getProjectAccent(project);
  const accentText = accent === 'signet' ? 'text-signet' : 'text-bloom';
  const accentBorder = accent === 'signet' ? 'hover:border-signet' : 'hover:border-bloom';

  return (
    <article className="grid gap-6 sm:grid-cols-5 sm:gap-10">
      <Link
        href={href}
        className={`group block overflow-hidden rounded-lg border border-mist sm:col-span-3 ${accentBorder}`}
      >
        {project.screenshots[0] && (
          <Image
            src={getScreenshotUrl(project.screenshots[0])}
            alt={project.title[locale]}
            width={800}
            height={500}
            className="aspect-[8/5] w-full object-cover transition-transform duration-300 group-hover:-translate-y-1"
            unoptimized
          />
        )}
      </Link>

      <div className="flex flex-col justify-center sm:col-span-2">
        <p className={`font-mono text-xs uppercase tracking-wide ${accentText}`}>
          {project.category === 'produit_bytechnum' ? 'ByTechnum' : project.clientName ?? ''}
        </p>
        <h3 className="mt-2 font-display text-2xl font-semibold">
          <Link href={href} className="hover:underline">
            {project.title[locale]}
          </Link>
        </h3>
        <p className="mt-2 text-slate">{project.tagline[locale]}</p>

        <ul className="mt-4 flex flex-wrap gap-2">
          {project.stack.map((technology) => (
            <li key={technology} className="rounded-full border border-mist px-2.5 py-0.5 font-mono text-xs">
              {technology}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs">
          <Link href={href} className={`${accentText} hover:underline`}>
            {dictionary.cta.viewProject} ↗
          </Link>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${accentText} hover:underline`}
            >
              {dictionary.cta.liveDemo} ↗
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate hover:text-ink hover:underline"
            >
              {SOURCE_LABEL[locale]} ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
