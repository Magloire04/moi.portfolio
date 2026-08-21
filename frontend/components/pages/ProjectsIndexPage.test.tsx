import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProjectsIndexPage } from './ProjectsIndexPage';
import type { Project } from '@/lib/types';

function makeProject(overrides: Partial<Project>): Project {
  return {
    id: '1',
    slug: 'x',
    category: 'produit_bytechnum',
    title: { fr: 'Titre', en: 'Title' },
    tagline: { fr: 'Accroche', en: 'Tagline' },
    summary: { fr: 'Résumé', en: 'Summary' },
    body: { fr: 'Corps', en: 'Body' },
    clientName: null,
    stack: [],
    role: null,
    screenshots: ['projects/x.png'],
    liveUrl: null,
    repoUrl: null,
    featured: false,
    testimonials: [],
    ...overrides,
  };
}

describe('ProjectsIndexPage', () => {
  it('renders every project passed in', () => {
    const projects = [
      makeProject({ id: '1', slug: 'a', title: { fr: 'Projet A', en: 'Project A' } }),
      makeProject({ id: '2', slug: 'b', title: { fr: 'Projet B', en: 'Project B' } }),
    ];

    render(<ProjectsIndexPage locale="fr" projects={projects} />);

    expect(screen.getByText('Projet A')).toBeInTheDocument();
    expect(screen.getByText('Projet B')).toBeInTheDocument();
  });

  it('links each card to the locale-correct detail URL', () => {
    const projects = [makeProject({ id: '1', slug: 'tracacajou' })];

    render(<ProjectsIndexPage locale="en" projects={projects} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/en/projects/tracacajou');
  });
});
