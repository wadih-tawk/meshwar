import { describe, it, expect } from 'vitest';
import { findSuggestion, SUGGESTIONS } from './suggestions.js';

describe('outing ideas', () => {
  it('has a unique address for every idea', () => {
    const slugs = SUGGESTIONS.map(idea => idea.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('credits every photo with its author and license', () => {
    const photos = SUGGESTIONS.flatMap(idea => idea.photos || []);
    expect(photos.length).toBeGreaterThan(0);
    photos.forEach(photo => {
      expect(photo.author).toBeTruthy();
      expect(photo.license).toBeTruthy();
      expect(photo.page).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
    });
  });

  it('finds an idea by its address', () => {
    expect(findSuggestion('harissa').place.name).toBe('Harissa');
    expect(findSuggestion('nowhere')).toBe(null);
  });
});

describe('idea content', () => {
  it('gives every idea a title, a place with coordinates and a list of things to do', () => {
    SUGGESTIONS.forEach(idea => {
      expect(idea.title).toBeTruthy();
      expect(typeof idea.place.lat).toBe('number');
      expect(typeof idea.place.lon).toBe('number');
      expect(Array.isArray(idea.todo)).toBe(true);
    });
  });
});
