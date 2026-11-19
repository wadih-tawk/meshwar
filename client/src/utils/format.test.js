import { describe, it, expect } from 'vitest';
import { activityPhoto, activityIcon, describeWeather } from './format.js';

describe('activity helpers', () => {
  it('gives each activity its own photo', () => {
    expect(activityPhoto('ski')).toBe('/photos/ski.jpg');
  });

  it('falls back to the "other" photo and icon for an unknown activity', () => {
    expect(activityPhoto('surf')).toBe('/photos/other.jpg');
    expect(activityIcon('surf')).toBe('📍');
  });
});

describe('describeWeather', () => {
  it('turns Open-Meteo weather codes into a label and an icon', () => {
    expect(describeWeather(0).label).toBe('Clear sky');
    expect(describeWeather(63).label).toBe('Rain');
    expect(describeWeather(75).label).toBe('Snow');
  });

  it('returns nothing when the code is missing', () => {
    expect(describeWeather(null)).toBe(null);
  });
});
