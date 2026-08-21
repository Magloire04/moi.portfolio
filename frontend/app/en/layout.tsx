import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SITE_URL, STATIC_PAGE_PATH_PAIRS, toLanguageAlternates } from '@/lib/routes';
import '../globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ByTechnum — Elisée Atonde, full-stack developer',
    template: '%s | ByTechnum',
  },
  description:
    'Custom web development from Benin: management applications, digital identity, traceability, data-protection compliance.',
  // Correct for the home pages themselves ('/' and '/en/'). Every other page
  // under this layout sets its own `alternates` in its `metadata`/`generateMetadata`
  // export — Next.js does NOT recompute this per leaf page, it inherits this exact
  // value verbatim from the nearest ancestor segment that defines it.
  alternates: toLanguageAlternates(STATIC_PAGE_PATH_PAIRS.home),
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
