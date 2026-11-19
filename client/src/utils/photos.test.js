import { describe, it, expect } from 'vitest';
import { checkPhotoFile, initials } from './photos.js';

describe('checkPhotoFile', () => {
  it('accepts JPG, PNG and WebP photos up to 5 MB', () => {
    expect(checkPhotoFile({ type: 'image/png', size: 1000 })).toBe('');
  });

  it('explains what is wrong with other files', () => {
    expect(checkPhotoFile({ type: 'image/svg+xml', size: 1000 })).toMatch(/JPG, PNG or WebP/);
    expect(checkPhotoFile({ type: 'image/jpeg', size: 6 * 1024 * 1024 })).toMatch(/5 MB/);
  });
});

describe('initials', () => {
  it('uses the first letters of the first two words', () => {
    expect(initials('wadih tawk')).toBe('WT');
    expect(initials('  Alex  ')).toBe('A');
    expect(initials('')).toBe('?');
  });
});
