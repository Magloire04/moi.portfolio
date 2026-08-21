import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SITE_URL, getAlternateHref } from '@/lib/routes';
import '../globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ByTechnum — Elisée Atonde, full-stack developer',
    template: '%s | ByTechnum',
  },
  description:
    'Custom web development from Benin: management applications, digital identity, traceability, data-protection compliance.',
  alternates: {
    languages: {
      fr: getAlternateHref('/en', 'en'),
      en: '/en',
    },
  },
};

export default function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header locale="en" />
        <main>{children}</main>
        <Footer locale="en" />
      </body>
    </html>
  );
}
