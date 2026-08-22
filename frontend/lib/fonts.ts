import { Bricolage_Grotesque, IBM_Plex_Mono, Public_Sans } from 'next/font/google';

// Variable names are distinct from the Tailwind theme tokens of the same
// role (defined in app/globals.css's `@theme inline`) — that block maps
// `--font-display`/`--font-sans`/`--font-mono` to `var(--font-display-raw)`
// etc. plus a fallback stack, so the two must not share a name (a CSS custom
// property can't reference itself).
export const displayFont = Bricolage_Grotesque({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display-raw',
  display: 'swap',
});

export const bodyFont = Public_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans-raw',
  display: 'swap',
});

export const monoFont = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-mono-raw',
  display: 'swap',
});

export const fontVariables = `${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`;
