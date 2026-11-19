import { describe, it, expect } from 'vitest';
import { activityPhoto, activityIcon } from './format.js';

describe('activity helpers', () => {
  it('gives each activity its own photo', () => {
    expect(activityPhoto('ski')).toBe('/photos/ski.jpg');
  });

  it('falls back to the "other" photo and icon for an unknown activity', () => {
    expect(activityPhoto('surf')).toBe('/photos/other.jpg');
    expect(activityIcon('surf')).toBe('📍');
  });
});
