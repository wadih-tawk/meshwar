import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { it, expect, vi } from 'vitest';
import IdeaPage from './IdeaPage.jsx';

vi.mock('../api/weather.js', () => ({
  getForecast: vi.fn(() => Promise.resolve({ min: 15, max: 24, rainChance: 5, wind: 10, code: 1 })),
}));
vi.mock('../api/places.js', () => ({
  getPlaceSummary: vi.fn(() => Promise.resolve(null)),
}));

function renderAt(path) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/ideas/:slug" element={<IdeaPage />} />
      </Routes>
    </MemoryRouter>
  );
}

it('shows an idea with its stops, places to stay and photo credits', async () => {
  renderAt('/ideas/bekaa-wine-trail');
  expect(screen.getByRole('heading', { name: 'Wine day in the Bekaa' })).toBeInTheDocument();
  expect(screen.getByText('Château Ksara')).toBeInTheDocument();
  expect(screen.getByText(/Chtaura Park Hotel/)).toBeInTheDocument();
  expect(screen.getByText(/via Wikimedia Commons/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Plan an outing here' })).toHaveAttribute('href', '/outings/new');
  expect(await screen.findByText('Good to go')).toBeInTheDocument();
});

it('says when the idea does not exist', () => {
  renderAt('/ideas/nowhere');
  expect(screen.getByText('Idea not found')).toBeInTheDocument();
});
