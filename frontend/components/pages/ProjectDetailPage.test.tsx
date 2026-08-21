import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProjectDetailPage } from './ProjectDetailPage';
import type { Project } from '@/lib/types';

const namedClientProject: Project = {
  id: '1',
  slug: 'oeil-360-finance',
  category: 'produit_bytechnum',
  title: { fr: 'Oeil 360° Finance', en: 'Oeil 360° Finance' },
  tagline: { fr: 'Accroche FR', en: 'Tagline EN' },
  summary: { fr: 'Résumé FR', en: 'Summary EN' },
  body: { fr: 'Corps détaillé FR', en: 'Detailed body EN' },
  clientName: null,
  stack: ['Laravel', 'PHP 8.4'],
  role: 'Développeur full-stack',
  screenshots: ['projects/oeil360-1.png', 'projects/oeil360-2.png'],
  liveUrl: 'https://oeil360finance.bytechnum.com',
  repoUrl: 'https://github.com/Magloire04/oeil-360-finance',
  featured: true,
  testimonials: [
    {
      id: 't1',
      authorName: 'Une cliente',
      authorRole: 'Directrice',
      authorCompany: null,
      quote: { fr: 'Citation FR', en: 'Quote EN' },
    },
  ],
};

describe('ProjectDetailPage', () => {
  it('renders the title, tagline, body, and stack for the given locale', () => {
    render(<ProjectDetailPage locale="fr" project={namedClientProject} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Oeil 360° Finance' })).toBeInTheDocument();
    expect(screen.getByText('Corps détaillé FR')).toBeInTheDocument();
    expect(screen.getByText('Laravel')).toBeInTheDocument();
  });

  it('renders a live-demo link when liveUrl is present', () => {
    render(<ProjectDetailPage locale="fr" project={namedClientProject} />);

    expect(screen.getByRole('link', { name: /démo en ligne/i })).toHaveAttribute(
      'href',
      'https://oeil360finance.bytechnum.com',
    );
  });

  it('renders visible testimonials with their locale-correct quote', () => {
    render(<ProjectDetailPage locale="en" project={namedClientProject} />);

    expect(screen.getByText('Quote EN')).toBeInTheDocument();
    expect(screen.getByText('Une cliente')).toBeInTheDocument();
  });

  it('does not render a client name when clientName is null', () => {
    render(<ProjectDetailPage locale="fr" project={namedClientProject} />);

    expect(screen.queryByText(/client\s*:/i)).not.toBeInTheDocument();
  });

  it('renders the client name when present and displayed', () => {
    const namedProject = { ...namedClientProject, clientName: 'CAFAB' };
    render(<ProjectDetailPage locale="fr" project={namedProject} />);

    expect(screen.getByText('CAFAB')).toBeInTheDocument();
  });
});
