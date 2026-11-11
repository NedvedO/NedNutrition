import type { Weekday } from './program/types';

/** Local calendar date as YYYY-MM-DD (not UTC, so late-evening entries land on the right day). */
export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Monday = 0 ... Sunday = 6 (JavaScript's getDay() starts at Sunday). */
export function weekdayOf(date: Date): Weekday {
  return ((date.getDay() + 6) % 7) as Weekday;
}

export function startOfWeek(date: Date): Date {
  return addDays(date, -weekdayOf(date));
}

/** Date keys for the `count` days ending on `end`, oldest first. */
export function lastDays(end: Date, count: number): string[] {
  return Array.from({ length: count }, (_, i) => dateKey(addDays(end, i - count + 1)));
}
