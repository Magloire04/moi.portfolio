import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="fr">
      <body>
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-2xl font-semibold">Page introuvable</h1>
          <p className="text-slate-600">La page que vous cherchez n&apos;existe pas ou plus.</p>
          <div className="flex gap-4">
            <Link href="/" className="underline">Retour à l&apos;accueil</Link>
            <Link href="/en" className="underline">English home</Link>
          </div>
        </main>
      </body>
    </html>
  );
}
