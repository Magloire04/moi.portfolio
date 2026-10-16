import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders the legal links', () => {
    render(<Footer locale="fr" />);

    expect(screen.getByRole('link', { name: /politique de confidentialité/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /conditions d'utilisation/i })).toBeInTheDocument();
  });

  it('never links out to a GitHub repository', () => {
    render(<Footer locale="fr" />);

    expect(screen.queryByText(/code source/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/github\.com/i)).not.toBeInTheDocument();
  });
});
