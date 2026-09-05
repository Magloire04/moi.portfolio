import Link from 'next/link';
import { getDictionary } from '@/content/i18n';
import type { Locale } from '@/lib/types';

const SOURCE_LABEL = { fr: 'Code source', en: 'Source code' };

const FR_LEGAL_HREFS = { privacyPolicy: '/politique-de-confidentialite', termsOfUse: '/conditions-generales-utilisation' };
const EN_LEGAL_HREFS = { privacyPolicy: '/en/privacy-policy', termsOfUse: '/en/terms-of-use' };

export function Footer({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const year = new Date().getFullYear();
  const legalHrefs = locale === 'fr' ? FR_LEGAL_HREFS : EN_LEGAL_HREFS;

  return (
    <footer className="border-t border-mist py-8">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 font-mono text-xs text-slate">
        <p>
          TECHNUM, {year}. {dictionary.footer.rights}
        </p>
        <nav className="flex flex-wrap items-center gap-4">
          <Link href={legalHrefs.privacyPolicy} className="transition-colors hover:text-blue">
            {dictionary.legal.privacyPolicy}
          </Link>
          <Link href={legalHrefs.termsOfUse} className="transition-colors hover:text-blue">
            {dictionary.legal.termsOfUse}
          </Link>
          <a
            href="https://github.com/Magloire04/moi.portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-blue"
          >
            {SOURCE_LABEL[locale]} ↗
          </a>
        </nav>
      </div>
    </footer>
  );
}
