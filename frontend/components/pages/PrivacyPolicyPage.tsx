import { LEGAL_LAST_UPDATED, privacyPolicyIntro, privacyPolicySections } from '@/content/legal';
import type { Locale } from '@/lib/types';

const HEADING = { fr: 'Politique de confidentialité', en: 'Privacy Policy' };
const LAST_UPDATED_LABEL = { fr: 'Dernière mise à jour', en: 'Last updated' };

export function PrivacyPolicyPage({ locale }: { locale: Locale }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{HEADING[locale]}</h1>
      <p className="mt-6 text-lg leading-8 text-ink">{privacyPolicyIntro[locale]}</p>
      <p className="mt-4 font-mono text-xs text-slate">
        {LAST_UPDATED_LABEL[locale]} : {LEGAL_LAST_UPDATED[locale]}
      </p>

      <div className="mt-12 space-y-8">
        {privacyPolicySections.map((section) => (
          <section key={section.id} className="border-t border-mist pt-6">
            <h2 className="font-medium">{section.heading[locale]}</h2>
            <p className="mt-2 text-sm text-slate">{section.body[locale]}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
