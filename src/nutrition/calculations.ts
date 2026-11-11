import type { Goals, LogEntry, Nutrients, NutrientProgress } from './types';

const NUTRIENT_KEYS = ['calories', 'protein', 'carbs', 'fat'] as const;

export const ZERO_NUTRIENTS: Nutrients = { calories: 0, protein: 0, carbs: 0, fat: 0 };

/** Rounds to one decimal place, avoiding floating point noise like 0.30000000000000004. */
function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function isValidServings(servings: number): boolean {
  return Number.isFinite(servings) && servings > 0;
}

/** Nutrients for a number of servings of a food (per-serving values times servings). */
export function scaleNutrients(perServing: Nutrients, servings: number): Nutrients {
  if (!isValidServings(servings)) {
    throw new RangeError(`servings must be a positive number, got ${servings}`);
  }
  return {
    calories: round1(perServing.calories * servings),
    protein: round1(perServing.protein * servings),
    carbs: round1(perServing.carbs * servings),
    fat: round1(perServing.fat * servings),
  };
}

/** Sum of the nutrients of every entry logged on the given date. */
export function dailyTotals(entries: LogEntry[], date: string): Nutrients {
  const totals = { ...ZERO_NUTRIENTS };
  for (const entry of entries) {
    if (entry.date !== date) continue;
    const scaled = scaleNutrients(entry.food, entry.servings);
    for (const key of NUTRIENT_KEYS) {
      totals[key] += scaled[key];
    }
  }
  for (const key of NUTRIENT_KEYS) {
    totals[key] = round1(totals[key]);
  }
  return totals;
}

export function progress(consumed: number, goal: number): NutrientProgress {
  const difference = round1(goal - consumed);
  return {
    consumed,
    goal,
    remaining: Math.max(difference, 0),
    over: Math.max(-difference, 0),
  };
}

/** Progress toward every goal for the given totals. */
export function goalProgress(
  totals: Nutrients,
  goals: Goals,
): Record<keyof Nutrients, NutrientProgress> {
  return {
    calories: progress(totals.calories, goals.calories),
    protein: progress(totals.protein, goals.protein),
    carbs: progress(totals.carbs, goals.carbs),
    fat: progress(totals.fat, goals.fat),
  };
}

export function isValidGoals(goals: Goals): boolean {
  return NUTRIENT_KEYS.every((key) => Number.isFinite(goals[key]) && goals[key] > 0);
}
