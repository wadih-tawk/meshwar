import { describe, it, expect } from 'vitest';
import { packingList } from './packing.js';

describe('packingList', () => {
  it('starts with the items for the activity', () => {
    expect(packingList('beach', null)).toContain('Swimsuit');
  });

  it('adds an umbrella when rain is likely', () => {
    expect(packingList('hike', { rainChance: 80, min: 15 })).toContain('Umbrella or rain jacket');
  });

  it('adds a warm jacket when it is cold', () => {
    const items = packingList('city', { rainChance: 10, min: 5 });
    expect(items).toContain('Warm jacket');
    expect(items).not.toContain('Umbrella or rain jacket');
  });

  it('uses the general list for an unknown activity', () => {
    expect(packingList('surf', null)).toEqual(['Water', 'Phone charger', 'Snacks']);
  });
});
