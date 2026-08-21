import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ServicesPage } from './ServicesPage';

describe('ServicesPage', () => {
  it('renders every service title and description in French', () => {
    render(<ServicesPage locale="fr" />);

    expect(screen.getByText('Applications web sur-mesure')).toBeInTheDocument();
    expect(screen.getByText('Conformité données personnelles (APDP)')).toBeInTheDocument();
  });

  it('renders every service title and description in English', () => {
    render(<ServicesPage locale="en" />);

    expect(screen.getByText('Custom web applications')).toBeInTheDocument();
    expect(screen.getByText('Data-protection compliance (APDP)')).toBeInTheDocument();
  });
});
