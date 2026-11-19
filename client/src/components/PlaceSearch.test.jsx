import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it, expect, vi } from 'vitest';
import PlaceSearch from './PlaceSearch.jsx';

vi.mock('../api/weather.js', () => ({
  searchPlaces: vi.fn(() =>
    Promise.resolve([
      { id: 1, name: 'Tripoli', region: 'Tripoli', country: 'Libya', lat: 32.89, lon: 13.19 },
      { id: 2, name: 'Tripoli', region: 'North Lebanon', country: 'Lebanon', lat: 34.43, lon: 35.84 },
    ])
  ),
}));

it('shows matching places while typing, without a search button', async () => {
  render(<PlaceSearch selected={null} onPick={() => {}} />);
  await userEvent.type(screen.getByLabelText('Place'), 'Trip');
  expect(await screen.findByText('North Lebanon, Lebanon')).toBeInTheDocument();
  expect(screen.getByText('Tripoli, Libya')).toBeInTheDocument();
});

it('picks the place chosen with the arrow keys and Enter', async () => {
  const onPick = vi.fn();
  render(<PlaceSearch selected={null} onPick={onPick} />);
  const input = screen.getByLabelText('Place');
  await userEvent.type(input, 'Trip');
  await screen.findByText('North Lebanon, Lebanon');
  await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
  expect(onPick).toHaveBeenCalledWith({ name: 'Tripoli', country: 'Lebanon', lat: 34.43, lon: 35.84 });
});

it('does not pick the first match on Enter alone', async () => {
  const onPick = vi.fn();
  render(<PlaceSearch selected={null} onPick={onPick} />);
  await userEvent.type(screen.getByLabelText('Place'), 'Trip');
  await screen.findByText('North Lebanon, Lebanon');
  await userEvent.keyboard('{Enter}');
  expect(onPick).not.toHaveBeenCalled();
});
