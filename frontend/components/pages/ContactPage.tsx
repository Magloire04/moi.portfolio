import Link from 'next/link';
import { ContactForm } from '@/components/ContactForm';
import type { Locale } from '@/lib/types';

const HEADING = { fr: 'Contact', en: 'Contact' };
const INTRO = {
  fr: 'Une question, un mandat à discuter : écrivez-moi directement.',
  en: 'A question, an engagement to discuss: write to me directly.',
};
const PRIVACY_NOTICE = {
  fr: 'En envoyant ce message, vous acceptez notre',
  en: 'By sending this message, you agree to our',
};
const PRIVACY_LINK_LABEL = { fr: 'politique de confidentialité', en: 'privacy policy' };
const PRIVACY_HREF = { fr: '/politique-de-confidentialite', en: '/en/privacy-policy' };

export function ContactPage({ locale }: { locale: Locale }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-16 sm:py-24">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{HEADING[locale]}</h1>
      <p className="mt-3 text-lg text-slate">{INTRO[locale]}</p>
      <div className="mt-10">
        <ContactForm locale={locale} />
        <p className="mt-4 text-xs text-slate">
          {PRIVACY_NOTICE[locale]}{' '}
          <Link href={PRIVACY_HREF[locale]} className="underline hover:text-blue">
            {PRIVACY_LINK_LABEL[locale]}
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
