import { describe, it, expect } from 'vitest';
import { directionsUrl, placeMapUrl, routeMapUrl } from './maps.js';

const bcharre = { lat: 34.25, lon: 36.01 };
const beirut = { lat: 33.89, lon: 35.5 };

describe('Google Maps links', () => {
  it('shows the place on an embedded map', () => {
    const url = new URL(placeMapUrl(bcharre));
    expect(url.searchParams.get('q')).toBe('34.25,36.01');
    expect(url.searchParams.get('output')).toBe('embed');
  });

  it('draws the route from the user to the place', () => {
    const url = new URL(routeMapUrl(beirut, bcharre));
    expect(url.searchParams.get('saddr')).toBe('33.89,35.5');
    expect(url.searchParams.get('daddr')).toBe('34.25,36.01');
  });

  it('opens directions in Google Maps, with or without a starting point', () => {
    expect(new URL(directionsUrl(bcharre)).searchParams.get('origin')).toBe(null);
    expect(new URL(directionsUrl(bcharre, beirut)).searchParams.get('origin')).toBe('33.89,35.5');
    expect(new URL(directionsUrl(bcharre)).searchParams.get('destination')).toBe('34.25,36.01');
  });
});
