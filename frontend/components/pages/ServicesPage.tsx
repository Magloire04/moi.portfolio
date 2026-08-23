import { services } from '@/content/services';
import type { Locale } from '@/lib/types';

const HEADING = { fr: 'Services', en: 'Services' };
const INTRO = {
  fr: 'Ce que TECHNUM livre concrètement : pas une liste de mots-clés, mais les compétences appliquées sur les projets présentés dans le portfolio.',
  en: 'What TECHNUM actually delivers: not a buzzword list, but the skills applied across the projects shown in this portfolio.',
};

export function ServicesPage({ locale }: { locale: Locale }) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{HEADING[locale]}</h1>
      <p className="mt-3 max-w-2xl text-lg text-slate">{INTRO[locale]}</p>

      <div className="mt-12 grid gap-10 sm:grid-cols-2">
        {services.map((service, index) => (
          <article key={service.id} className="border-t border-mist pt-5">
            <p className="font-mono text-xs text-slate">{String(index + 1).padStart(2, '0')}</p>
            <h2 className="mt-2 font-medium">{service.title[locale]}</h2>
            <p className="mt-2 text-sm text-slate">{service.description[locale]}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
