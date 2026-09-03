import { getDictionary } from '@/content/i18n';
import type { Locale } from '@/lib/types';

const SOURCE_LABEL = { fr: 'Code source', en: 'Source code' };

export function Footer({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-mist py-8">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 font-mono text-xs text-slate">
        <p>
          TECHNUM, {year}. {dictionary.footer.rights}
        </p>
        <a
          href="https://github.com/Magloire04/moi.portfolio"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-blue"
        >
          {SOURCE_LABEL[locale]} ↗
        </a>
      </div>
    </footer>
  );
}
