'use client';

import { useState, type FormEvent } from 'react';
import { ApiError, submitContactMessage } from '@/lib/api';
import type { Locale } from '@/lib/types';

const COPY = {
  fr: {
    name: 'Nom',
    email: 'E-mail',
    message: 'Message',
    projectInterest: 'Projet concerné (optionnel)',
    submit: 'Envoyer',
    submitting: 'Envoi en cours…',
    success: 'Message envoyé, je vous réponds rapidement.',
    genericError: "Une erreur est survenue, réessayez dans un instant.",
    validation: {
      required: 'Ce champ est requis.',
      invalidEmail: 'Adresse e-mail invalide.',
      tooLong: 'Ce champ est trop long.',
    },
  },
  en: {
    name: 'Name',
    email: 'Email',
    message: 'Message',
    projectInterest: 'Project of interest (optional)',
    submit: 'Send',
    submitting: 'Sending…',
    success: "Message sent, I'll get back to you shortly.",
    genericError: 'Something went wrong, please try again in a moment.',
    validation: {
      required: 'This field is required.',
      invalidEmail: 'Invalid email address.',
      tooLong: 'This field is too long.',
    },
  },
} as const;

type Status = 'idle' | 'submitting' | 'success' | 'error';

// Basic shape check only — not a full RFC 5322 validator. Just needs to catch the
// obviously-invalid case the native `type="email"` constraint used to catch before
// `noValidate` disabled it.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactFormValues = {
  name: string;
  email: string;
  message: string;
  projectInterest?: string;
};

type ValidationCopy = { required: string; invalidEmail: string; tooLong: string };

/**
 * Client-side mirror of the backend's `StoreContactMessageRequest` rules (see
 * backend/openapi.yaml). Runs before the API call so a visitor gets instant feedback
 * without a round trip; the backend remains the authoritative validator regardless.
 */
function validateContactForm(values: ContactFormValues, copy: ValidationCopy): string | null {
  if (!values.name.trim()) return copy.required;
  if (values.name.length > 120) return copy.tooLong;

  if (!values.email.trim()) return copy.required;
  if (values.email.length > 180) return copy.tooLong;
  if (!EMAIL_PATTERN.test(values.email)) return copy.invalidEmail;

  if (!values.message.trim()) return copy.required;
  if (values.message.length > 5000) return copy.tooLong;

  if (values.projectInterest && values.projectInterest.length > 120) return copy.tooLong;

  return null;
}

export function ContactForm({ locale }: { locale: Locale }) {
  const copy = COPY[locale];
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Capture the form element synchronously: React nulls out event.currentTarget
    // once the handler yields (e.g. across an `await`), so it must not be read afterward.
    const formElement = event.currentTarget;

    const form = new FormData(formElement);
    const values = {
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      message: String(form.get('message') ?? ''),
      projectInterest: String(form.get('projectInterest') ?? '') || undefined,
      website: String(form.get('website') ?? ''),
    };

    // Client-side validation (see validateContactForm above). Runs before any network
    // call so an obviously-invalid submission never reaches the API.
    const validationError = validateContactForm(values, copy.validation);
    if (validationError) {
      setStatus('error');
      setErrorMessage(validationError);
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      await submitContactMessage({
        name: values.name,
        email: values.email,
        message: values.message,
        projectInterest: values.projectInterest,
        locale,
        website: values.website,
      });
      setStatus('success');
      formElement.reset();
    } catch (error) {
      setStatus('error');
      // Only an ApiError carries a backend-authored, visitor-safe message. Anything
      // else (network failure, non-JSON response, etc.) falls back to a generic,
      // localized message rather than leaking a raw TypeError/SyntaxError.
      setErrorMessage(error instanceof ApiError ? error.message : copy.genericError);
    }
  }

  if (status === 'success') {
    return <p role="status" className="text-lg text-signet">{copy.success}</p>;
  }

  const fieldClassName =
    'mt-1.5 w-full rounded-md border border-mist bg-transparent px-3 py-2 text-ink outline-none transition-colors focus:border-signet';
  const labelClassName = 'block font-mono text-xs uppercase tracking-wide text-slate';

  return (
    // noValidate: the backend is the authoritative validator (see backend/openapi.yaml) and
    // returns human-readable error messages we display ourselves; without this, the browser's
    // native constraint validation on the `type="email"` field silently blocks the submit event
    // for an invalid address, so our own error UI would never get a chance to show.
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="name" className={labelClassName}>{copy.name}</label>
        <input id="name" name="name" type="text" required maxLength={120} className={fieldClassName} />
      </div>

      <div>
        <label htmlFor="email" className={labelClassName}>{copy.email}</label>
        <input id="email" name="email" type="email" required maxLength={180} className={fieldClassName} />
      </div>

      <div>
        <label htmlFor="projectInterest" className={labelClassName}>{copy.projectInterest}</label>
        <input id="projectInterest" name="projectInterest" type="text" maxLength={120} className={fieldClassName} />
      </div>

      <div>
        <label htmlFor="message" className={labelClassName}>{copy.message}</label>
        <textarea id="message" name="message" required maxLength={5000} rows={6} className={fieldClassName} />
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
        <p role="alert" className="text-sm text-error">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="rounded-full bg-signet px-5 py-2.5 font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === 'submitting' ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}
