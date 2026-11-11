import { addDays, dateKey, lastDays, parseDateKey, startOfWeek, weekdayOf } from '../dates';
import { dailyTotals } from '../nutrition/calculations';
import type { LogEntry, Nutrients } from '../nutrition/types';
import { kgToPounds } from '../program/calculateProgram';
import type { DayTarget, MacroProgram, Weekday } from '../program/types';
import type { WeighIn } from '../storage/appState';

export type ViewMode = 'consumed' | 'remaining';
export type Macro = keyof Nutrients;
export const MACROS: Macro[] = ['calories', 'protein', 'fat', 'carbs'];

export type DaySummary = {
  date: string;
  weekday: Weekday;
  target: DayTarget;
  consumed: Nutrients;
  isToday: boolean;
  isFuture: boolean;
};

export function targetFor(program: MacroProgram, date: Date): DayTarget {
  return program.days[weekdayOf(date)];
}

/** Targets and what was eaten for each day of the current week (Monday to Sunday). */
export function weekSummary(program: MacroProgram, log: LogEntry[], today: Date): DaySummary[] {
  const monday = startOfWeek(today);
  const todayKey = dateKey(today);
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(monday, i);
    const key = dateKey(day);
    return {
      date: key,
      weekday: i as Weekday,
      target: program.days[i],
      consumed: dailyTotals(log, key),
      isToday: key === todayKey,
      isFuture: key > todayKey,
    };
  });
}

export function remainingAmount(consumed: number, target: number): number {
  return Math.max(Math.round(target - consumed), 0);
}

/** How full a bar is (0 to 1): the share eaten, or the share still left. */
export function barFraction(consumed: number, target: number, mode: ViewMode): number {
  if (target <= 0) return 0;
  const fraction = mode === 'consumed' ? consumed / target : (target - consumed) / target;
  return Math.min(Math.max(fraction, 0), 1);
}

// ---- Habits ----

export function loggedDates(log: LogEntry[]): Set<string> {
  return new Set(log.map((e) => e.date));
}

/** One cell per day for the last `days` days, oldest first; true when something was recorded. */
export function habitGrid(dates: Set<string>, today: Date, days = 30): boolean[] {
  return lastDays(today, days).map((key) => dates.has(key));
}

/** Days with a record so far this week (Monday through today). */
export function countThisWeek(dates: Set<string>, today: Date): number {
  return lastDays(today, weekdayOf(today) + 1).filter((key) => dates.has(key)).length;
}

// ---- Weight ----

/**
 * Smooths daily scale weights with an exponentially weighted moving average,
 * so water-weight swings don't hide the real trend.
 */
export function trendWeights(weighIns: WeighIn[], smoothing = 0.1): WeighIn[] {
  const sorted = [...weighIns].sort((a, b) => a.date.localeCompare(b.date));
  let trend: number | null = null;
  return sorted.map(({ date, kg }) => {
    trend = trend === null ? kg : trend + smoothing * (kg - trend);
    return { date, kg: trend };
  });
}

export function displayWeight(kg: number, unit: 'lb' | 'kg'): number {
  const value = unit === 'lb' ? kgToPounds(kg) : kg;
  return Math.round(value * 10) / 10;
}

/** Entries from the last `days` days, ending today. */
export function entriesSince<T extends { date: string }>(
  entries: T[],
  today: Date,
  days: number,
): T[] {
  const first = dateKey(addDays(today, -(days - 1)));
  const last = dateKey(today);
  return entries.filter((e) => e.date >= first && e.date <= last);
}

// ---- Energy balance ----

export type EnergyBalance = {
  /** Average calories on days with food logged, or null when nothing was logged. */
  nutritionAverage: number | null;
  /** Expenditure, or the average daily target. */
  reference: number;
  difference: number | null;
  /** The reference line for each day, oldest first. */
  referenceSeries: number[];
  /** Calories eaten each day, or null on days without a log. */
  nutritionSeries: (number | null)[];
};

export function energyBalance(
  program: MacroProgram,
  log: LogEntry[],
  today: Date,
  compareTo: 'expenditure' | 'targets',
  days = 30,
): EnergyBalance {
  const keys = lastDays(today, days);
  const logged = loggedDates(log);

  const nutritionSeries = keys.map((key) =>
    logged.has(key) ? dailyTotals(log, key).calories : null,
  );
  const eaten = nutritionSeries.filter((c): c is number => c !== null);
  const nutritionAverage = eaten.length
    ? Math.round(eaten.reduce((sum, c) => sum + c, 0) / eaten.length)
    : null;

  const referenceSeries = keys.map((key) =>
    compareTo === 'expenditure'
      ? program.expenditure
      : targetFor(program, parseDateKey(key)).calories,
  );
  const reference = Math.round(referenceSeries.reduce((sum, c) => sum + c, 0) / days);

  return {
    nutritionAverage,
    reference,
    difference: nutritionAverage === null ? null : nutritionAverage - reference,
    referenceSeries,
    nutritionSeries,
  };
}
