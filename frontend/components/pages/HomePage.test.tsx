import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomePage } from './HomePage';
import type { Project, Settings } from '@/lib/types';

const featuredProject: Project = {
  id: '1',
  slug: 'oeil-360-finance',
  category: 'produit_bytechnum',
  title: { fr: 'Oeil 360° Finance', en: 'Oeil 360° Finance' },
  tagline: { fr: 'Gestion de finances personnelles', en: 'Personal finance management' },
  summary: { fr: 'Résumé', en: 'Summary' },
  body: { fr: 'Corps', en: 'Body' },
  clientName: null,
  stack: ['Laravel'],
  role: null,
  screenshots: ['projects/oeil360.png'],
  liveUrl: 'https://oeil360finance.bytechnum.com',
  repoUrl: null,
  featured: true,
  testimonials: [],
};

const settings: Settings = { availableForWork: true };

describe('HomePage', () => {
  it('renders the hero heading and featured projects for French', () => {
    render(<HomePage locale="fr" featuredProjects={[featuredProject]} settings={settings} />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Oeil 360° Finance')).toBeInTheDocument();
  });

  it('shows the available-for-work message when settings.availableForWork is true', () => {
    render(<HomePage locale="fr" featuredProjects={[featuredProject]} settings={settings} />);

    expect(screen.getByText(/disponible pour de nouveaux mandats/i)).toBeInTheDocument();
  });

  it('shows the not-available message when settings.availableForWork is false', () => {
    render(
      <HomePage
        locale="fr"
        featuredProjects={[featuredProject]}
        settings={{ availableForWork: false }}
      />,
    );

    expect(screen.getByText(/actuellement complet/i)).toBeInTheDocument();
  });

  it('renders in English when locale is en', () => {
    render(<HomePage locale="en" featuredProjects={[featuredProject]} settings={settings} />);

    expect(screen.getByText('Personal finance management')).toBeInTheDocument();
  });
});
