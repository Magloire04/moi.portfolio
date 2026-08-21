import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from './ContactForm';
import * as api from '@/lib/api';

describe('ContactForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders name, email, and message fields plus a hidden honeypot field', () => {
    render(<ContactForm locale="fr" />);

    expect(screen.getByLabelText(/nom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-?mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();

    const honeypot = document.querySelector('input[name="website"]');
    expect(honeypot).toBeInTheDocument();
    expect(honeypot).toHaveAttribute('tabindex', '-1');
    expect(honeypot).toHaveAttribute('autocomplete', 'off');
  });

  it('submits the form and shows a success message', async () => {
    vi.spyOn(api, 'submitContactMessage').mockResolvedValue({ received: true });
    const user = userEvent.setup();

    render(<ContactForm locale="fr" />);

    await user.type(screen.getByLabelText(/nom/i), 'Amina Traoré');
    await user.type(screen.getByLabelText(/e-?mail/i), 'amina@example.com');
    await user.type(screen.getByLabelText(/message/i), "Bonjour, je souhaite discuter d'un mandat.");
    await user.click(screen.getByRole('button', { name: /envoyer/i }));

    await waitFor(() => {
      expect(screen.getByText(/message envoyé/i)).toBeInTheDocument();
    });

    expect(api.submitContactMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Amina Traoré',
        email: 'amina@example.com',
        message: "Bonjour, je souhaite discuter d'un mandat.",
        locale: 'fr',
      }),
    );
  });

  it('shows an error message when the API call fails', async () => {
    vi.spyOn(api, 'submitContactMessage').mockRejectedValue(new Error("L'email est invalide."));
    const user = userEvent.setup();

    render(<ContactForm locale="fr" />);

    await user.type(screen.getByLabelText(/nom/i), 'A');
    await user.type(screen.getByLabelText(/e-?mail/i), 'pas-un-email');
    await user.type(screen.getByLabelText(/message/i), 'Test');
    await user.click(screen.getByRole('button', { name: /envoyer/i }));

    await waitFor(() => {
      expect(screen.getByText("L'email est invalide.")).toBeInTheDocument();
    });
  });

  it('renders English labels and success message when locale is en', async () => {
    vi.spyOn(api, 'submitContactMessage').mockResolvedValue({ received: true });
    const user = userEvent.setup();

    render(<ContactForm locale="en" />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^name/i), 'Amina');
    await user.type(screen.getByLabelText(/email/i), 'amina@example.com');
    await user.type(screen.getByLabelText(/message/i), 'Hello');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText(/message sent/i)).toBeInTheDocument();
    });
  });
});
