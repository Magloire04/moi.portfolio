import Image from 'next/image';
import Link from 'next/link';
import { getScreenshotUrl } from '@/lib/api';
import { getProjectAccent, getProjectKicker } from '@/lib/accent';
import { getDictionary } from '@/content/i18n';
import { TestimonialQuote } from '@/components/TestimonialQuote';
import type { Locale, Project } from '@/lib/types';

const CLIENT_LABEL = { fr: 'Client', en: 'Client' };
const ROLE_LABEL = { fr: 'Rôle', en: 'Role' };
const BACK_LABEL = { fr: '← Tous les projets', en: '← All projects' };
const SOURCE_LABEL = { fr: 'Code source', en: 'Source code' };

export function ProjectDetailPage({ locale, project }: { locale: Locale; project: Project }) {
  const dictionary = getDictionary(locale);
  const accent = getProjectAccent(project);
  const accentText = accent === 'blue' ? 'text-blue' : 'text-blue-dark';
  const accentBg = accent === 'blue' ? 'bg-blue' : 'bg-blue-dark';
  const projectsHref = locale === 'fr' ? '/projets' : '/en/projects';

  return (
    <article className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <Link href={projectsHref} className="font-mono text-xs text-slate hover:text-ink">
        {BACK_LABEL[locale]}
      </Link>

      <header className="mt-6">
        <p className={`font-mono text-xs uppercase tracking-wide ${accentText}`}>
          {getProjectKicker(project, locale)}
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{project.title[locale]}</h1>
        <p className="mt-3 text-lg text-slate">{project.tagline[locale]}</p>

        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs text-slate">
          {project.clientName && (
            <div>
              <dt className="uppercase tracking-wide">{CLIENT_LABEL[locale]}</dt>
              <dd className="mt-1 text-ink">{project.clientName}</dd>
            </div>
          )}
          {project.role && (
            <div>
              <dt className="uppercase tracking-wide">{ROLE_LABEL[locale]}</dt>
              <dd className="mt-1 text-ink">{project.role}</dd>
            </div>
          )}
        </dl>

        <ul className="mt-5 flex flex-wrap gap-2">
          {project.stack.map((technology) => (
            <li key={technology} className="rounded-full border border-mist px-2.5 py-0.5 font-mono text-xs">
              {technology}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-4">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-full px-5 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-90 ${accentBg}`}
            >
              {dictionary.cta.liveDemo} ↗
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-mist px-5 py-2.5 text-sm font-medium transition-colors hover:border-ink"
            >
              {SOURCE_LABEL[locale]} ↗
            </a>
          )}
        </div>
      </header>

      {project.screenshots.length > 0 && (
        <div className="mt-12 space-y-8">
          {project.screenshots.map((screenshot) => (
            <Image
              key={screenshot}
              src={getScreenshotUrl(screenshot)}
              alt={project.title[locale]}
              width={1200}
              height={675}
              className="w-full rounded-lg border border-mist"
              unoptimized
            />
          ))}
        </div>
      )}

      <div className="prose prose-slate mt-12 max-w-none whitespace-pre-line text-[1.05rem] leading-7 text-ink">
        {project.body[locale]}
      </div>

      {project.testimonials.length > 0 && (
        <div className="mt-12 space-y-6 border-t border-mist pt-8">
          {project.testimonials.map((testimonial) => (
            <TestimonialQuote key={testimonial.id} testimonial={testimonial} locale={locale} accent={accent} />
          ))}
        </div>
      )}
    </article>
  );
}
