import { addDays, dateKey, lastDays, parseDateKey, startOfWeek, weekdayOf } from './dates';

describe('dates', () => {
  it('formats local dates as YYYY-MM-DD and parses them back', () => {
    const date = new Date(2026, 0, 5, 23, 30);
    expect(dateKey(date)).toBe('2026-01-05');
    expect(dateKey(parseDateKey('2026-01-05'))).toBe('2026-01-05');
  });

  it('adds days across month ends', () => {
    expect(dateKey(addDays(new Date(2026, 0, 31), 1))).toBe('2026-02-01');
  });

  it('numbers weekdays from Monday', () => {
    expect(weekdayOf(new Date(2026, 10, 9))).toBe(0); // Monday
    expect(weekdayOf(new Date(2026, 10, 15))).toBe(6); // Sunday
    expect(dateKey(startOfWeek(new Date(2026, 10, 15)))).toBe('2026-11-09');
  });

  it('lists the last few days, oldest first', () => {
    expect(lastDays(new Date(2026, 10, 10), 3)).toEqual(['2026-11-08', '2026-11-09', '2026-11-10']);
  });
});
