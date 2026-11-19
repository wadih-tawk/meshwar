import { it, expect, vi } from 'vitest';
import { searchPlaces } from './weather.js';

function answer(results) {
  return Promise.resolve({ ok: true, json: () => Promise.resolve({ results }) });
}

it('lists places in Lebanon first and removes duplicates', async () => {
  const batroun = { id: 1, name: 'Batroûn', admin1: 'North Lebanon', country: 'Lebanon', latitude: 34.25, longitude: 35.66 };
  const bath = { id: 2, name: 'Bath', admin1: 'England', country: 'United Kingdom', latitude: 51.38, longitude: -2.36 };
  const fakeFetch = vi.fn(url => (url.includes('countryCode=LB') ? answer([batroun]) : answer([bath, batroun])));
  vi.stubGlobal('fetch', fakeFetch);
  const places = await searchPlaces('Bat');
  expect(places.map(place => place.name)).toEqual(['Batroûn', 'Bath']);
  expect(fakeFetch).toHaveBeenCalledTimes(2);
  vi.unstubAllGlobals();
});

it('still finds places abroad when nothing in Lebanon matches', async () => {
  const honolulu = { id: 3, name: 'Honolulu', admin1: 'Hawaii', country: 'United States', latitude: 21.31, longitude: -157.86 };
  vi.stubGlobal('fetch', vi.fn(url => (url.includes('countryCode=LB') ? answer(undefined) : answer([honolulu]))));
  const places = await searchPlaces('Honolulu');
  expect(places[0].country).toBe('United States');
  vi.unstubAllGlobals();
});
