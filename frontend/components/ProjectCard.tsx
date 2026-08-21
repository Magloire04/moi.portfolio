import Link from 'next/link';
import Image from 'next/image';
import { getScreenshotUrl } from '@/lib/api';
import type { Locale, Project } from '@/lib/types';

export function ProjectCard({
  project,
  locale,
  href,
}: {
  project: Project;
  locale: Locale;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block overflow-hidden rounded-lg border border-slate-200 transition hover:border-slate-400"
    >
      {project.screenshots[0] && (
        <Image
          src={getScreenshotUrl(project.screenshots[0])}
          alt={project.title[locale]}
          width={640}
          height={360}
          className="aspect-video w-full object-cover"
          unoptimized
        />
      )}
      <div className="p-4">
        <h3 className="font-semibold">{project.title[locale]}</h3>
        <p className="mt-1 text-sm text-slate-600">{project.tagline[locale]}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {project.stack.map((technology) => (
            <li
              key={technology}
              className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700"
            >
              {technology}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
