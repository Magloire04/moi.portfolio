import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AboutPage } from './AboutPage';

describe('AboutPage', () => {
  it('renders the French bio and method points', () => {
    render(<AboutPage locale="fr" />);

    expect(screen.getByText(/basé au Bénin, et je conçois des applications/i)).toBeInTheDocument();
    expect(screen.getByText('Workflow par pull request, même en solo')).toBeInTheDocument();
  });

  it('renders the English bio and method points', () => {
    render(<AboutPage locale="en" />);

    expect(screen.getByText(/based in Benin, building applications/i)).toBeInTheDocument();
    expect(screen.getByText('Pull-request workflow, even solo')).toBeInTheDocument();
  });

  it('renders the profile name as a heading', () => {
    render(<AboutPage locale="fr" />);

    expect(screen.getByRole('heading', { level: 1, name: /Elisée Magloire Atonde/i })).toBeInTheDocument();
  });

  it('renders a decorative avatar image next to the name', () => {
    const { container } = render(<AboutPage locale="fr" />);

    const avatar = container.querySelector('img');
    expect(avatar).not.toBeNull();
    expect(avatar).toHaveAttribute('alt', '');
  });

  it('renders a badge linking to bytechnum.com in a new tab', () => {
    render(<AboutPage locale="fr" />);

    const link = screen.getByRole('link', { name: 'bytechnum.com ↗' });
    expect(link).toHaveAttribute('href', 'https://bytechnum.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('renders a mailto badge with the contact email', () => {
    render(<AboutPage locale="fr" />);

    expect(screen.getByRole('link', { name: /elisee\.atonde@bytechnum\.com/i })).toHaveAttribute(
      'href',
      'mailto:elisee.atonde@bytechnum.com',
    );
  });

  it('shows the available-for-work badge when settings.availableForWork is true', () => {
    render(<AboutPage locale="fr" settings={{ availableForWork: true }} />);

    expect(screen.getByText(/disponible pour de nouveaux mandats/i)).toBeInTheDocument();
  });

  it('shows the not-available badge when settings.availableForWork is false', () => {
    render(<AboutPage locale="fr" settings={{ availableForWork: false }} />);

    expect(screen.getByText(/actuellement complet/i)).toBeInTheDocument();
  });

  it('does not crash and shows no availability badge when settings is omitted', () => {
    render(<AboutPage locale="fr" />);

    expect(screen.queryByText(/disponible pour de nouveaux mandats/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/actuellement complet/i)).not.toBeInTheDocument();
  });

  it('shows the project count stat when projectCount is provided', () => {
    render(<AboutPage locale="fr" projectCount={7} />);

    expect(screen.getByText('7 produits en production')).toBeInTheDocument();
  });

  it('shows the English project count stat for locale en', () => {
    render(<AboutPage locale="en" projectCount={7} />);

    expect(screen.getByText('7 products in production')).toBeInTheDocument();
  });

  it('does not crash and shows no stat when projectCount is omitted', () => {
    render(<AboutPage locale="fr" />);

    expect(screen.queryByText(/produits en production/i)).not.toBeInTheDocument();
  });
});
