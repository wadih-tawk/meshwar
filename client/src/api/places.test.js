import { describe, it, expect, vi } from 'vitest';
import { cleanExtract, getPlaceSummary, isNear, isSight, pickNearby } from './places.js';

describe('isNear', () => {
  it('accepts an article close to the outing', () => {
    expect(isNear({ coordinates: [{ lat: 34.44, lon: 35.83 }] }, 34.43, 35.84)).toBe(true);
  });

  it('rejects an article about another place with the same name', () => {
    expect(isNear({ coordinates: [{ lat: 32.89, lon: 13.19 }] }, 34.43, 35.84)).toBe(false);
  });

  it('rejects an article without coordinates', () => {
    expect(isNear({}, 34.43, 35.84)).toBe(false);
  });
});

describe('isSight', () => {
  it('keeps places worth visiting', () => {
    expect(isSight({ description: 'Castle in Byblos, Lebanon' })).toBe(true);
    expect(isSight({ description: 'Ski resort in Lebanon' })).toBe(true);
  });

  it('leaves out districts, villages and battles', () => {
    expect(isSight({ description: 'District in Keserwan-Jbeil, Lebanon' })).toBe(false);
    expect(isSight({ description: '1102–1109 siege after the First Crusade' })).toBe(false);
    expect(isSight({ description: '' })).toBe(false);
  });
});

describe('pickNearby', () => {
  const places = [
    { title: 'Byblos', description: 'City in Lebanon', photo: 'a.jpg' },
    { title: 'Byblos Castle', description: 'Castle in Byblos', photo: 'b.jpg' },
    { title: 'Byblos District', description: 'District in Keserwan-Jbeil', photo: 'c.jpg' },
    { title: 'Byblos Fossil Museum', description: 'Museum in Byblos', photo: null },
    { title: 'Temple of the Obelisks', description: 'Temple in Byblos', photo: 'd.jpg' },
  ];

  it('keeps sights with a photo and leaves out the main place', () => {
    expect(pickNearby(places, 'Byblos').map(place => place.title)).toEqual(['Byblos Castle', 'Temple of the Obelisks']);
  });
});

describe('cleanExtract', () => {
  it('removes the pronunciation in brackets after the name', () => {
    expect(cleanExtract('Tripoli ( TRIP-əl-ee; Arabic: طرابلس, pronounced [ta]; see below) is the largest city.')).toBe('Tripoli is the largest city.');
  });

  it('keeps the comma that follows the brackets', () => {
    expect(cleanExtract('Byblos ( BIB-loss; Ancient Greek: Βύβλος), also known as Jbeil, is a city.')).toBe('Byblos, also known as Jbeil, is a city.');
  });

  it('leaves text without early brackets alone', () => {
    expect(cleanExtract('Faqra is a ski resort.')).toBe('Faqra is a ski resort.');
  });
});

describe('getPlaceSummary', () => {
  it('asks Wikipedia only once for the same place', async () => {
    const page = { pageid: 1, title: 'Batroun', description: 'City in Lebanon', extract: 'Batroun is a city.', coordinates: [{ lat: 34.25, lon: 35.66 }] };
    const fakeFetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ query: { pages: [page] } }) }));
    vi.stubGlobal('fetch', fakeFetch);
    const place = { name: 'Batroun', country: 'Lebanon', lat: 34.25, lon: 35.66 };
    const first = await getPlaceSummary(place);
    const second = await getPlaceSummary(place);
    expect(first.title).toBe('Batroun');
    expect(second).toBe(first);
    expect(fakeFetch).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });
});
