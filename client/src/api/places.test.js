import { describe, it, expect } from 'vitest';
import { isNear } from './places.js';

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
