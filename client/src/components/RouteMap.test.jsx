import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it, expect, vi } from 'vitest';
import RouteMap from './RouteMap.jsx';

const place = { name: 'Bcharre', country: 'Lebanon', lat: 34.25, lon: 36.01 };

it('shows a map of the place and a Google Maps link', () => {
  render(<RouteMap place={place} />);
  expect(screen.getByTitle('Map of Bcharre')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /open in google maps/i }).getAttribute('href')).toContain('destination=34.25%2C36.01');
});

it('draws the route once the browser shares the location', async () => {
  const getCurrentPosition = vi.fn(success => success({ coords: { latitude: 33.89, longitude: 35.5 } }));
  vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });
  render(<RouteMap place={place} />);
  await userEvent.click(screen.getByRole('button', { name: /show the route/i }));
  expect(screen.getByTitle('Route to Bcharre').getAttribute('src')).toContain('saddr=33.89%2C35.5');
  vi.unstubAllGlobals();
});

it('explains what to do when the location is refused', async () => {
  vi.stubGlobal('navigator', { geolocation: { getCurrentPosition: (success, failure) => failure() } });
  render(<RouteMap place={place} />);
  await userEvent.click(screen.getByRole('button', { name: /show the route/i }));
  expect(screen.getByText(/could not get your location/i)).toBeInTheDocument();
  vi.unstubAllGlobals();
});
