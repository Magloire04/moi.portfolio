'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getAlternateHref } from '@/lib/routes';
import { getDictionary } from '@/content/i18n';
import type { Locale } from '@/lib/types';

const FR_HREFS = {
  home: '/',
  services: '/services',
  projects: '/projets',
  about: '/a-propos',
  contact: '/contact',
};

const EN_HREFS = {
  home: '/en',
  services: '/en/services',
  projects: '/en/projects',
  about: '/en/about',
  contact: '/en/contact',
};

export function Header({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const dictionary = getDictionary(locale);
  const hrefs = locale === 'fr' ? FR_HREFS : EN_HREFS;
  const alternateHref = getAlternateHref(pathname, locale);

  return (
    <header className="border-b border-slate-200">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href={hrefs.home} className="font-mono text-lg font-semibold">
          ByTechnum
        </Link>
        <ul className="flex items-center gap-6 text-sm">
          <li><Link href={hrefs.services}>{dictionary.nav.services}</Link></li>
          <li><Link href={hrefs.projects}>{dictionary.nav.projects}</Link></li>
          <li><Link href={hrefs.about}>{dictionary.nav.about}</Link></li>
          <li><Link href={hrefs.contact}>{dictionary.nav.contact}</Link></li>
          <li>
            <Link href={alternateHref} className="uppercase text-slate-500">
              {locale === 'fr' ? 'EN' : 'FR'}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
