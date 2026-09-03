import type { ProjectAccent } from '@/lib/accent';
import type { Locale, Testimonial } from '@/lib/types';

export function TestimonialQuote({
  testimonial,
  locale,
  accent = 'blue',
}: {
  testimonial: Testimonial;
  locale: Locale;
  accent?: ProjectAccent;
}) {
  const accentText = accent === 'blue' ? 'text-blue' : 'text-blue-dark';

  return (
    <blockquote className="border-l-2 border-mist pl-5">
      <p className="text-lg text-ink">
        <span aria-hidden="true" className={`font-display ${accentText}`}>
          &ldquo;
        </span>
        {testimonial.quote[locale]}
        <span aria-hidden="true" className={`font-display ${accentText}`}>
          &rdquo;
        </span>
      </p>
      <footer className="mt-2 font-mono text-xs text-slate">
        <span>{testimonial.authorName}</span>
        {testimonial.authorRole && <span>, {testimonial.authorRole}</span>}
        {testimonial.authorCompany && <span>, {testimonial.authorCompany}</span>}
      </footer>
    </blockquote>
  );
}
