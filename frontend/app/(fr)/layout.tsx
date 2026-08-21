import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SITE_URL, getAlternateHref } from '@/lib/routes';
import '../globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ByTechnum — Elisée Atonde, développeur full-stack',
    template: '%s | ByTechnum',
  },
  description:
    'Développement web sur-mesure au Bénin : applications de gestion, identité numérique, traçabilité, conformité APDP.',
  alternates: {
    languages: {
      fr: '/',
      en: getAlternateHref('/', 'fr'),
    },
  },
};

export default function FrenchRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Header locale="fr" />
        <main>{children}</main>
        <Footer locale="fr" />
      </body>
    </html>
  );
}
