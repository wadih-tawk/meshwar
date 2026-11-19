import { describe, it, expect } from 'vitest';
import { getVerdict } from './verdict.js';

describe('getVerdict', () => {
  it('says rain is likely at 80% rain chance', () => {
    expect(getVerdict({ rainChance: 80, min: 20 }).text).toBe('Rain likely, consider rescheduling');
  });

  it('treats exactly 60% as rain likely', () => {
    expect(getVerdict({ rainChance: 60, min: 20 }).tone).toBe('rain');
  });

  it('says bring a jacket when it is dry but cold', () => {
    expect(getVerdict({ rainChance: 59, min: 9 }).text).toBe('Bring a jacket');
  });

  it('treats exactly 12 °C as warm enough', () => {
    expect(getVerdict({ rainChance: 10, min: 12 }).text).toBe('Good to go');
  });

  it('says good to go when it is mild and dry', () => {
    expect(getVerdict({ rainChance: 10, min: 18 }).tone).toBe('good');
  });

  it('gives no verdict when the minimum or the rain chance is missing', () => {
    expect(getVerdict({ rainChance: 23, min: null })).toBe(null);
    expect(getVerdict({ rainChance: null, min: 15 })).toBe(null);
  });
});
