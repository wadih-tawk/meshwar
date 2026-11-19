import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import { countdownLabel, nextSaturday, today, timeAgo } from './dates.js';

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

describe('timeAgo', () => {
  const now = new Date('2026-11-27T12:00:00');

  it('says how long ago something happened', () => {
    expect(timeAgo('2026-11-27T11:59:40', now)).toBe('just now');
    expect(timeAgo('2026-11-27T11:15:00', now)).toBe('45 min ago');
    expect(timeAgo('2026-11-27T07:00:00', now)).toBe('5 h ago');
    expect(timeAgo('2026-11-26T09:00:00', now)).toBe('yesterday');
    expect(timeAgo('2026-11-23T12:00:00', now)).toBe('4 days ago');
    expect(timeAgo('2026-11-02T12:00:00', now)).toBe('2 Nov 2026');
  });
});
