import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { it, expect } from 'vitest';
import OutingCard from './OutingCard.jsx';

const outing = {
  _id: 'o1',
  title: 'Hike in Qadisha',
  activity: 'hike',
  place: { name: 'Bcharre', country: 'Lebanon', lat: 34.25, lon: 36.01 },
  date: '2030-06-01',
};

function renderCard(props) {
  render(
    <MemoryRouter>
      <OutingCard outing={outing} loading={false} error={null} {...props} />
    </MemoryRouter>
  );
}

it('shows "Rain likely" for an 80% rain forecast', () => {
  renderCard({ timing: 'ready', forecast: { min: 14, max: 20, rainChance: 80, wind: 10 } });
  expect(screen.getByText('Rain likely, consider rescheduling')).toBeInTheDocument();
  expect(screen.getByText(/14–20 °C/)).toBeInTheDocument();
});

it('shows the title and links to the outing page', () => {
  renderCard({ timing: 'ready', forecast: { min: 14, max: 20, rainChance: 10, wind: 10 } });
  expect(screen.getByText('Hike in Qadisha')).toBeInTheDocument();
  expect(screen.getByRole('link')).toHaveAttribute('href', '/outings/o1');
});

it('shows when the forecast becomes available for a far date', () => {
  renderCard({ timing: 'later', forecast: null });
  expect(screen.getByText('Forecast from Sat 18 May')).toBeInTheDocument();
});

it('gives no verdict when the forecast is not complete', () => {
  renderCard({ timing: 'ready', forecast: { min: null, max: null, rainChance: 23, wind: null } });
  expect(screen.getByText('Forecast not complete yet')).toBeInTheDocument();
  expect(screen.queryByText('Bring a jacket')).not.toBeInTheDocument();
});

it('shows loading instead of crashing when there is no forecast yet', () => {
  renderCard({ timing: 'ready', forecast: null });
  expect(screen.getByText('Loading forecast…')).toBeInTheDocument();
});
