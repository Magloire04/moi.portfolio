import { services } from '@/content/services';
import type { Locale } from '@/lib/types';

const HEADING = { fr: 'Services', en: 'Services' };
const INTRO = {
  fr: "Ce que ByTechnum livre concrètement — pas une liste de mots-clés, mais les compétences appliquées sur les projets présentés dans le portfolio.",
  en: 'What ByTechnum actually delivers — not a buzzword list, but the skills applied across the projects shown in this portfolio.',
};

export function ServicesPage({ locale }: { locale: Locale }) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold">{HEADING[locale]}</h1>
      <p className="mt-3 max-w-2xl text-slate-600">{INTRO[locale]}</p>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        {services.map((service) => (
          <article key={service.id}>
            <h2 className="font-semibold">{service.title[locale]}</h2>
            <p className="mt-2 text-sm text-slate-600">{service.description[locale]}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
