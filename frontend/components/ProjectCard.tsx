import Link from 'next/link';
import Image from 'next/image';
import { getScreenshotUrl } from '@/lib/api';
import { getProjectAccent } from '@/lib/accent';
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
  const accent = getProjectAccent(project);
  const accentBorder = accent === 'signet' ? 'hover:border-signet' : 'hover:border-bloom';

  return (
    <Link
      href={href}
      className={`group block overflow-hidden rounded-lg border border-mist transition-colors ${accentBorder}`}
    >
      {project.screenshots[0] && (
        <Image
          src={getScreenshotUrl(project.screenshots[0])}
          alt={project.title[locale]}
          width={640}
          height={360}
          className="aspect-video w-full object-cover transition-transform duration-300 group-hover:-translate-y-1"
          unoptimized
        />
      )}
      <div className="p-5">
        <h3 className="font-display font-semibold">{project.title[locale]}</h3>
        <p className="mt-1 text-sm text-slate">{project.tagline[locale]}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {project.stack.map((technology) => (
            <li key={technology} className="rounded-full border border-mist px-2.5 py-0.5 font-mono text-xs">
              {technology}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
