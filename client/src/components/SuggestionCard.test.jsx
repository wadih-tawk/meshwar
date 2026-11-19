import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { it, expect } from 'vitest';
import SuggestionCard from './SuggestionCard.jsx';
import { SUGGESTIONS } from '../utils/suggestions.js';

const suggestion = SUGGESTIONS[0];

it('shows the place, its forecast verdict and a button to plan an outing there', () => {
  render(
    <MemoryRouter>
      <SuggestionCard suggestion={suggestion} date="2030-06-01" photo={null} photoLoading={false} forecast={{ min: 18, max: 25, rainChance: 5 }} />
    </MemoryRouter>
  );
  expect(screen.getByText('Kadisha Valley')).toBeInTheDocument();
  expect(screen.getByText('Good to go')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Plan an outing here' })).toHaveAttribute('href', '/outings/new');
});
