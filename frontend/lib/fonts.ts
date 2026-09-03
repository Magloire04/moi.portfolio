import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';

// Les noms de variable sont volontairement différents des tokens Tailwind de
// même rôle (définis dans le `@theme inline` de app/globals.css) — ce bloc
// mappe `--font-display`/`--font-sans`/`--font-mono` vers
// `var(--font-display-raw)` etc. plus une pile de secours, donc les deux ne
// peuvent pas porter le même nom (une custom property CSS ne peut pas se
// référencer elle-même).
//
// Brand book (p.11) : une seule famille sans-serif pour tout. Les deux rôles
// ci-dessous chargent IBM Plex Sans — displayFont en graisses plus fortes
// pour les titres, bodyFont en graisses plus légères pour le texte courant —
// ce qui respecte la règle "une seule famille" tout en gardant la
// distinction titres/texte que chaque composant exprime déjà via
// font-display vs. le font-sans par défaut sur <body>.
export const displayFont = IBM_Plex_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700'],
  variable: '--font-display-raw',
  display: 'swap',
});

export const bodyFont = IBM_Plex_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-sans-raw',
  display: 'swap',
});

// Inchangé : utilisé uniquement pour les détails techniques (tags de stack,
// kickers, chiffres). Plex Mono aux côtés de Plex Sans reste une seule
// histoire de famille ("Plex" partout, variante mono pour le code), pas une
// entorse à la règle "une seule famille sans-serif" du brand book.
export const monoFont = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-mono-raw',
  display: 'swap',
});

export const fontVariables = `${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`;
