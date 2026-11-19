import { describe, it, expect } from 'vitest';
import { firstName, greeting } from './greeting.js';

describe('greeting', () => {
  it('changes with the time of day', () => {
    expect(greeting(8)).toBe('Good morning');
    expect(greeting(14)).toBe('Good afternoon');
    expect(greeting(21)).toBe('Good evening');
    expect(greeting(2)).toBe('Good evening');
  });
});

describe('firstName', () => {
  it('keeps only the first name', () => {
    expect(firstName('Wadih Tawk')).toBe('Wadih');
    expect(firstName('')).toBe('');
  });
});
