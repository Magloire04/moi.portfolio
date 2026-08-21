import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProjectCard } from './ProjectCard';
import type { Project } from '@/lib/types';

const project: Project = {
  id: '1',
  slug: 'tracacajou',
  category: 'produit_bytechnum',
  title: { fr: 'TraçaCajou', en: 'TraçaCajou' },
  tagline: { fr: 'Certification de la filière anacarde', en: 'Cashew supply chain certification' },
  summary: { fr: 'Résumé FR', en: 'Summary EN' },
  body: { fr: 'Corps FR', en: 'Body EN' },
  clientName: null,
  stack: ['Laravel', 'Vue 3'],
  role: null,
  screenshots: ['projects/tracacajou.png'],
  liveUrl: null,
  repoUrl: null,
  featured: true,
  testimonials: [],
};

describe('ProjectCard', () => {
  it('renders the title, tagline, and stack for the given locale', () => {
    render(<ProjectCard project={project} locale="fr" href="/projets/tracacajou" />);

    expect(screen.getByText('TraçaCajou')).toBeInTheDocument();
    expect(screen.getByText('Certification de la filière anacarde')).toBeInTheDocument();
    expect(screen.getByText('Laravel')).toBeInTheDocument();
    expect(screen.getByText('Vue 3')).toBeInTheDocument();
  });

  it('links to the provided href', () => {
    render(<ProjectCard project={project} locale="fr" href="/projets/tracacajou" />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/projets/tracacajou');
  });

  it('renders the English tagline when locale is en', () => {
    render(<ProjectCard project={project} locale="en" href="/en/projects/tracacajou" />);

    expect(screen.getByText('Cashew supply chain certification')).toBeInTheDocument();
  });
});
