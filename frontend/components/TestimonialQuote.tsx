import type { Locale, Testimonial } from '@/lib/types';

export function TestimonialQuote({ testimonial, locale }: { testimonial: Testimonial; locale: Locale }) {
  return (
    <blockquote className="border-l-2 border-slate-300 pl-4">
      <p className="italic text-slate-700">
        <span aria-hidden="true">&ldquo;</span>
        {testimonial.quote[locale]}
        <span aria-hidden="true">&rdquo;</span>
      </p>
      <footer className="mt-2 text-sm text-slate-500">
        <span>{testimonial.authorName}</span>
        {testimonial.authorRole && <span>, {testimonial.authorRole}</span>}
        {testimonial.authorCompany && <span> — {testimonial.authorCompany}</span>}
      </footer>
    </blockquote>
  );
}
