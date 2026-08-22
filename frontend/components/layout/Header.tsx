'use client';

import { useState } from 'react';
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

const MENU_LABEL = { fr: 'Menu', en: 'Menu' };
const CLOSE_LABEL = { fr: 'Fermer', en: 'Close' };

export function Header({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const dictionary = getDictionary(locale);
  const hrefs = locale === 'fr' ? FR_HREFS : EN_HREFS;
  const alternateHref = getAlternateHref(pathname, locale);
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinkClassName = 'block py-2 transition-colors hover:text-ink';

  return (
    <header className="sticky top-0 z-10 border-b border-mist bg-paper/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href={hrefs.home} className="font-mono text-sm font-medium tracking-tight">
          ByTechnum
        </Link>

        <ul className="hidden items-center gap-6 font-mono text-xs uppercase tracking-wide text-slate sm:flex">
          <li>
            <Link href={hrefs.services} className={navLinkClassName}>
              {dictionary.nav.services}
            </Link>
          </li>
          <li>
            <Link href={hrefs.projects} className={navLinkClassName}>
              {dictionary.nav.projects}
            </Link>
          </li>
          <li>
            <Link href={hrefs.about} className={navLinkClassName}>
              {dictionary.nav.about}
            </Link>
          </li>
          <li>
            <Link
              href={hrefs.contact}
              className="rounded-full border border-mist px-3 py-1 text-ink transition-colors hover:border-signet hover:text-signet"
            >
              {dictionary.nav.contact}
            </Link>
          </li>
          <li aria-hidden="true" className="h-4 w-px bg-mist" />
          <li>
            <Link href={alternateHref} className="text-ink transition-colors hover:text-signet">
              {locale === 'fr' ? 'EN' : 'FR'}
            </Link>
          </li>
        </ul>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          className="font-mono text-xs uppercase tracking-wide text-ink sm:hidden"
        >
          {menuOpen ? CLOSE_LABEL[locale] : MENU_LABEL[locale]}
        </button>
      </nav>

      {menuOpen && (
        <ul
          id="mobile-nav"
          className="flex flex-col gap-1 border-t border-mist px-6 py-4 font-mono text-sm uppercase tracking-wide text-slate sm:hidden"
        >
          <li>
            <Link href={hrefs.services} className={navLinkClassName} onClick={() => setMenuOpen(false)}>
              {dictionary.nav.services}
            </Link>
          </li>
          <li>
            <Link href={hrefs.projects} className={navLinkClassName} onClick={() => setMenuOpen(false)}>
              {dictionary.nav.projects}
            </Link>
          </li>
          <li>
            <Link href={hrefs.about} className={navLinkClassName} onClick={() => setMenuOpen(false)}>
              {dictionary.nav.about}
            </Link>
          </li>
          <li>
            <Link href={hrefs.contact} className={navLinkClassName} onClick={() => setMenuOpen(false)}>
              {dictionary.nav.contact}
            </Link>
          </li>
          <li>
            <Link href={alternateHref} className={navLinkClassName}>
              {locale === 'fr' ? 'English' : 'Français'}
            </Link>
          </li>
        </ul>
      )}
    </header>
  );
}
