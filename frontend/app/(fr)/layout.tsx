import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { fontVariables } from '@/lib/fonts';
import { SITE_URL, STATIC_PAGE_PATH_PAIRS, toLanguageAlternates } from '@/lib/routes';
import '../globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ByTechnum, Elisée Atonde, développeur full-stack',
    template: '%s | ByTechnum',
  },
  description:
    'Développement web sur-mesure au Bénin : applications de gestion, identité numérique, traçabilité, conformité APDP.',
  // Correct for the home pages themselves ('/' and '/en/'). Every other page
  // under this layout sets its own `alternates` in its `metadata`/`generateMetadata`
  // export — Next.js does NOT recompute this per leaf page, it inherits this exact
  // value verbatim from the nearest ancestor segment that defines it.
  alternates: toLanguageAlternates(STATIC_PAGE_PATH_PAIRS.home),
};

export default function FrenchRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={fontVariables}>
      <body className="flex min-h-screen flex-col antialiased">
        <Header locale="fr" />
        <main className="flex-1">{children}</main>
        <Footer locale="fr" />
      </body>
    </html>
  );
}
