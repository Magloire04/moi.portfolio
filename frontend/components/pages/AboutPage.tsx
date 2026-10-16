import Image from 'next/image';
import { bio, methodPoints } from '@/content/about';
import type { Locale, Settings } from '@/lib/types';

const NAME = 'Elisée Magloire Atonde';
const ROLE_KICKER = {
  fr: 'TECHNUM · Développeur full-stack · Bénin',
  en: 'TECHNUM · Full-stack developer · Benin',
};
const CONTACT_EMAIL = 'elisee.atonde@bytechnum.com';
const METHOD_HEADING = { fr: 'Méthode', en: 'Method' };
const AVAILABLE = { fr: 'Disponible pour de nouveaux mandats', en: 'Available for new engagements' };
const NOT_AVAILABLE = { fr: 'Actuellement complet', en: 'Currently fully booked' };
const PRODUCT_COUNT = {
  fr: (n: number) => `${n} produits en production`,
  en: (n: number) => `${n} products in production`,
};

export function AboutPage({
  locale,
  settings,
  projectCount,
}: {
  locale: Locale;
  settings?: Settings;
  projectCount?: number;
}) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <div className="grid gap-12 sm:grid-cols-[260px_minmax(0,1fr)] sm:gap-16">
        <aside className="sm:sticky sm:top-24 sm:self-start">
          <Image
            src="/icon.png"
            alt=""
            width={96}
            height={96}
            className="rounded-full border border-mist bg-ice p-4"
          />
          <h1 className="mt-5 font-display text-2xl font-semibold leading-tight">{NAME}</h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-wide text-slate">{ROLE_KICKER[locale]}</p>

          <ul className="mt-6 flex flex-col items-start gap-2">
            <li>
              <a
                href="https://bytechnum.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-mist px-3 py-1 font-mono text-xs hover:border-blue hover:text-blue"
              >
                bytechnum.com ↗
              </a>
            </li>
            <li>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="rounded-full border border-mist px-3 py-1 font-mono text-xs hover:border-blue hover:text-blue"
              >
                {CONTACT_EMAIL}
              </a>
            </li>
          </ul>

          {settings && (
            <p className="mt-4 flex items-center gap-2 font-mono text-xs text-slate">
              <span
                aria-hidden="true"
                className={`inline-block h-2 w-2 rounded-full ${settings.availableForWork ? 'bg-blue' : 'bg-slate'}`}
              />
              {settings.availableForWork ? AVAILABLE[locale] : NOT_AVAILABLE[locale]}
            </p>
          )}

          {typeof projectCount === 'number' && (
            <p className="mt-4 font-mono text-xs text-slate">{PRODUCT_COUNT[locale](projectCount)}</p>
          )}
        </aside>

        <div className="border-t border-mist pt-10 sm:border-t-0 sm:pt-0">
          <p className="text-lg leading-8 text-ink">{bio[locale]}</p>

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
      </div>
    </div>
  );
}
