import Link from 'next/link';
import { fontVariables } from '@/lib/fonts';
import './globals.css';

export default function NotFound() {
  return (
    <html lang="fr" className={fontVariables}>
      <body className="antialiased">
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="font-mono text-sm text-slate">404</p>
          <h1 className="font-display text-2xl font-semibold">Page introuvable</h1>
          <p className="text-slate">La page que vous cherchez n&apos;existe pas ou plus.</p>
          <div className="mt-2 flex gap-6 font-mono text-sm">
            <Link href="/" className="text-blue hover:underline">Retour à l&apos;accueil</Link>
            <Link href="/en" className="text-blue hover:underline">English home</Link>
          </div>
        </main>
      </body>
    </html>
  );
}
