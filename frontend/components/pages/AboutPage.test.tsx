import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AboutPage } from './AboutPage';

describe('AboutPage', () => {
  it('renders the French bio and method points', () => {
    render(<AboutPage locale="fr" />);

    expect(screen.getByText(/développeur full-stack/i)).toBeInTheDocument();
    expect(screen.getByText('Workflow par pull request, même en solo')).toBeInTheDocument();
  });

  it('renders the English bio and method points', () => {
    render(<AboutPage locale="en" />);

    expect(screen.getByText(/full-stack developer/i)).toBeInTheDocument();
    expect(screen.getByText('Pull-request workflow, even solo')).toBeInTheDocument();
  });
});
