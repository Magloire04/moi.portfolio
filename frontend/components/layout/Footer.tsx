import { getDictionary } from '@/content/i18n';
import type { Locale } from '@/lib/types';

export function Footer({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 py-8 text-sm text-slate-500">
      <div className="mx-auto max-w-5xl px-6">
        <p>ByTechnum — {year}. {dictionary.footer.rights}</p>
      </div>
    </footer>
  );
}
