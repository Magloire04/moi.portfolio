import Image from 'next/image';
import { getScreenshotUrl } from '@/lib/api';
import { getDictionary } from '@/content/i18n';
import { TestimonialQuote } from '@/components/TestimonialQuote';
import type { Locale, Project } from '@/lib/types';

const CLIENT_LABEL = { fr: 'Client', en: 'Client' };
const ROLE_LABEL = { fr: 'Rôle', en: 'Role' };

export function ProjectDetailPage({ locale, project }: { locale: Locale; project: Project }) {
  const dictionary = getDictionary(locale);

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <header>
        <h1 className="text-3xl font-bold">{project.title[locale]}</h1>
        <p className="mt-2 text-lg text-slate-600">{project.tagline[locale]}</p>

        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-500">
          {project.clientName && (
            <div>
              <dt className="font-semibold">{CLIENT_LABEL[locale]}</dt>
              <dd>{project.clientName}</dd>
            </div>
          )}
          {project.role && (
            <div>
              <dt className="font-semibold">{ROLE_LABEL[locale]}</dt>
              <dd>{project.role}</dd>
            </div>
          )}
        </dl>

        <ul className="mt-4 flex flex-wrap gap-2">
          {project.stack.map((technology) => (
            <li
              key={technology}
              className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700"
            >
              {technology}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex gap-4">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-slate-900 px-4 py-2 text-sm text-white"
            >
              {dictionary.cta.liveDemo}
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border border-slate-300 px-4 py-2 text-sm"
            >
              GitHub
            </a>
          )}
        </div>
      </header>

      {project.screenshots.length > 0 && (
        <div className="mt-10 space-y-6">
          {project.screenshots.map((screenshot) => (
            <Image
              key={screenshot}
              src={getScreenshotUrl(screenshot)}
              alt={project.title[locale]}
              width={1200}
              height={675}
              className="w-full rounded-lg border border-slate-200"
              unoptimized
            />
          ))}
        </div>
      )}

      <div className="prose mt-10 max-w-none whitespace-pre-line text-slate-700">
        {project.body[locale]}
      </div>

      {project.testimonials.length > 0 && (
        <div className="mt-10 space-y-6">
          {project.testimonials.map((testimonial) => (
            <TestimonialQuote key={testimonial.id} testimonial={testimonial} locale={locale} />
          ))}
        </div>
      )}
    </article>
  );
}
