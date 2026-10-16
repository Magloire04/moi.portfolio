import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeaturedProjectShowcase } from './FeaturedProjectShowcase';
import type { Project } from '@/lib/types';

const baseProject: Project = {
  id: '1',
  slug: 'oeil-360-finance',
  category: 'produit_bytechnum',
  title: { fr: 'Oeil 360° Finance', en: 'Oeil 360° Finance' },
  tagline: { fr: 'Accroche', en: 'Tagline' },
  summary: { fr: 'Résumé', en: 'Summary' },
  body: { fr: 'Corps', en: 'Body' },
  clientName: null,
  stack: ['Laravel'],
  role: null,
  screenshots: ['projects/oeil360.png'],
  liveUrl: 'https://oeil360finance.bytechnum.com',
  repoUrl: 'https://github.com/Magloire04/oeil-360-finance',
  featured: true,
  testimonials: [],
};

describe('FeaturedProjectShowcase', () => {
  it('renders the live-demo link when liveUrl is present', () => {
    render(<FeaturedProjectShowcase project={baseProject} locale="fr" href="/projets/oeil-360-finance" />);

    expect(screen.getByRole('link', { name: /démo en ligne/i })).toHaveAttribute(
      'href',
      'https://oeil360finance.bytechnum.com',
    );
  });

  it('never renders a GitHub repository link, even when repoUrl is present', () => {
    render(<FeaturedProjectShowcase project={baseProject} locale="fr" href="/projets/oeil-360-finance" />);

    expect(screen.queryByRole('link', { name: /code source/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/github\.com/i)).not.toBeInTheDocument();
  });

  it('shows no external link at all when liveUrl is absent', () => {
    render(
      <FeaturedProjectShowcase
        project={{ ...baseProject, liveUrl: null, repoUrl: null }}
        locale="fr"
        href="/projets/oeil-360-finance"
      />,
    );

    expect(screen.queryByRole('link', { name: /démo en ligne/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /code source/i })).not.toBeInTheDocument();
  });
});
