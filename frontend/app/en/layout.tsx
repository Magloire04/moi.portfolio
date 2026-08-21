import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import '../globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ByTechnum — Elisée Atonde, full-stack developer',
    template: '%s | ByTechnum',
  },
  description:
    'Custom web development from Benin: management applications, digital identity, traceability, data-protection compliance.',
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
