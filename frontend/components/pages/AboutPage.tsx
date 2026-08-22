import { bio, methodPoints } from '@/content/about';
import type { Locale } from '@/lib/types';

const HEADING = { fr: 'À propos', en: 'About' };
const METHOD_HEADING = { fr: 'Méthode', en: 'Method' };

export function AboutPage({ locale }: { locale: Locale }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{HEADING[locale]}</h1>
      <p className="mt-6 text-lg leading-8 text-ink">{bio[locale]}</p>

      <h2 className="mt-16 font-display text-2xl font-semibold">{METHOD_HEADING[locale]}</h2>
      <ol className="mt-8 space-y-8">
        {methodPoints.map((point, index) => (
          <li key={point.id} className="flex gap-5 border-t border-mist pt-6 first:border-t-0 first:pt-0">
            <span className="font-mono text-sm text-slate">{String(index + 1).padStart(2, '0')}</span>
            <div>
              <h3 className="font-medium">{point.title[locale]}</h3>
              <p className="mt-1 text-sm text-slate">{point.body[locale]}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
