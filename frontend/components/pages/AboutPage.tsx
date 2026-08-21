import { bio, methodPoints } from '@/content/about';
import type { Locale } from '@/lib/types';

const HEADING = { fr: 'À propos', en: 'About' };
const METHOD_HEADING = { fr: 'Méthode', en: 'Method' };

export function AboutPage({ locale }: { locale: Locale }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold">{HEADING[locale]}</h1>
      <p className="mt-6 text-lg text-slate-700">{bio[locale]}</p>

      <h2 className="mt-12 text-2xl font-semibold">{METHOD_HEADING[locale]}</h2>
      <div className="mt-6 space-y-6">
        {methodPoints.map((point) => (
          <div key={point.id}>
            <h3 className="font-semibold">{point.title[locale]}</h3>
            <p className="mt-1 text-sm text-slate-600">{point.body[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
