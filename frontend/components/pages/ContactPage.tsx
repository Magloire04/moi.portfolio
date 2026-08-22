import { ContactForm } from '@/components/ContactForm';
import type { Locale } from '@/lib/types';

const HEADING = { fr: 'Contact', en: 'Contact' };
const INTRO = {
  fr: 'Une question, un mandat à discuter : écrivez-moi directement.',
  en: 'A question, an engagement to discuss: write to me directly.',
};

export function ContactPage({ locale }: { locale: Locale }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-16 sm:py-24">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{HEADING[locale]}</h1>
      <p className="mt-3 text-lg text-slate">{INTRO[locale]}</p>
      <div className="mt-10">
        <ContactForm locale={locale} />
      </div>
    </div>
  );
}
