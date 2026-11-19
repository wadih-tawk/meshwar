import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import { countdownLabel, nextSaturday, today } from './dates.js';

describe('nextSaturday', () => {
  it('is a Saturday, today or within the next 6 days', () => {
    const saturday = dayjs(nextSaturday());
    expect(saturday.day()).toBe(6);
    expect(saturday.diff(dayjs(today()), 'day')).toBeGreaterThanOrEqual(0);
    expect(saturday.diff(dayjs(today()), 'day')).toBeLessThanOrEqual(6);
  });
});

describe('countdownLabel', () => {
  it('says Today, Tomorrow, or how many days are left', () => {
    expect(countdownLabel(today())).toBe('Today');
    expect(countdownLabel(dayjs().add(1, 'day').format('YYYY-MM-DD'))).toBe('Tomorrow');
    expect(countdownLabel(dayjs().add(5, 'day').format('YYYY-MM-DD'))).toBe('In 5 days');
  });
});
