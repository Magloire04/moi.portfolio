'use client';

import { useState, type FormEvent } from 'react';
import { submitContactMessage } from '@/lib/api';
import type { Locale } from '@/lib/types';

const COPY = {
  fr: {
    name: 'Nom',
    email: 'E-mail',
    message: 'Message',
    projectInterest: 'Projet concerné (optionnel)',
    submit: 'Envoyer',
    submitting: 'Envoi en cours…',
    success: 'Message envoyé — je vous réponds rapidement.',
    genericError: "Une erreur est survenue, réessayez dans un instant.",
  },
  en: {
    name: 'Name',
    email: 'Email',
    message: 'Message',
    projectInterest: 'Project of interest (optional)',
    submit: 'Send',
    submitting: 'Sending…',
    success: "Message sent — I'll get back to you shortly.",
    genericError: 'Something went wrong, please try again in a moment.',
  },
} as const;

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm({ locale }: { locale: Locale }) {
  const copy = COPY[locale];
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Capture the form element synchronously: React nulls out event.currentTarget
    // once the handler yields (e.g. across an `await`), so it must not be read afterward.
    const formElement = event.currentTarget;
    setStatus('submitting');
    setErrorMessage('');

    const form = new FormData(formElement);

    try {
      await submitContactMessage({
        name: String(form.get('name') ?? ''),
        email: String(form.get('email') ?? ''),
        message: String(form.get('message') ?? ''),
        projectInterest: String(form.get('projectInterest') ?? '') || undefined,
        locale,
        website: String(form.get('website') ?? ''),
      });
      setStatus('success');
      formElement.reset();
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : copy.genericError);
    }
  }

  if (status === 'success') {
    return <p role="status">{copy.success}</p>;
  }

  return (
    // noValidate: the backend is the authoritative validator (see backend/openapi.yaml) and
    // returns human-readable error messages we display ourselves; without this, the browser's
    // native constraint validation on the `type="email"` field silently blocks the submit event
    // for an invalid address, so our own error UI would never get a chance to show.
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">{copy.name}</label>
        <input id="name" name="name" type="text" required maxLength={120} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">{copy.email}</label>
        <input id="email" name="email" type="email" required maxLength={180} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
      </div>

      <div>
        <label htmlFor="projectInterest" className="block text-sm font-medium">{copy.projectInterest}</label>
        <input id="projectInterest" name="projectInterest" type="text" maxLength={120} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium">{copy.message}</label>
        <textarea id="message" name="message" required maxLength={5000} rows={6} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
      </div>

      {/* Honeypot: invisible to a human visitor (off-screen, unreachable by keyboard tab order,
          excluded from autofill), but present in the DOM for a bot to fill in. Any real content
          here makes the backend silently drop the submission — see backend/openapi.yaml. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
      />

      {status === 'error' && (
        <p role="alert" className="text-sm text-red-600">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="rounded bg-slate-900 px-5 py-2.5 text-white disabled:opacity-50"
      >
        {status === 'submitting' ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}
