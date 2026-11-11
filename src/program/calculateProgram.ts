import type {
  BodyProfile,
  DayTarget,
  Diet,
  Goal,
  MacroProgram,
  ProgramAnswers,
  ProteinLevel,
  Training,
  Weekday,
} from './types';

/** Calorie targets never go below this (kcal/day). */
export const CALORIE_FLOOR = 1200;

/** High days get this much more than normal days; the weekly total stays the same. */
export const HIGH_DAY_MULTIPLIER = 1.1;

const KCAL_PER_KG_BODY_WEIGHT = 7700;

/** Activity multipliers applied to resting energy (rough population averages). */
const ACTIVITY_MULTIPLIER: Record<Training, number> = {
  none: 1.3,
  lifting: 1.45,
  cardio: 1.5,
  both: 1.6,
};

/** Weekly change as a fraction of body weight. */
const WEEKLY_RATE: Record<Goal, number> = {
  lose: -0.005,
  maintain: 0,
  gain: 0.0025,
};

/** Grams of protein per kg of body weight. */
const PROTEIN_PER_KG: Record<ProteinLevel, number> = {
  low: 1.6,
  moderate: 1.9,
  high: 2.2,
  extraHigh: 2.5,
};

/** Share of the non-protein calories that come from fat (the rest are carbs). */
const FAT_SHARE: Record<Exclude<Diet, 'keto'>, number> = {
  balanced: 0.4,
  lowFat: 0.25,
  lowCarb: 0.6,
};

const KETO_CARBS_G = 30;

export const WEEKDAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

/** Resting energy expenditure using the Mifflin-St Jeor equation (kcal/day). */
export function restingEnergy({ sex, age, heightCm, weightKg }: BodyProfile): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return base + (sex === 'male' ? 5 : -161);
}

export function estimateExpenditure(profile: BodyProfile, training: Training): number {
  return Math.round(restingEnergy(profile) * ACTIVITY_MULTIPLIER[training]);
}

/** Daily calorie change needed to move body weight at the goal's rate. */
export function dailyAdjustment(weightKg: number, goal: Goal): number {
  return Math.round((weightKg * WEEKLY_RATE[goal] * KCAL_PER_KG_BODY_WEIGHT) / 7);
}

export function proteinGrams(weightKg: number, level: ProteinLevel): number {
  return Math.round(weightKg * PROTEIN_PER_KG[level]);
}

/** Splits a day's calories into protein, fat and carbs (grams). */
export function splitMacros(
  calories: number,
  protein: number,
  diet: Diet,
): { protein: number; fat: number; carbs: number } {
  const remaining = Math.max(calories - protein * 4, 0);
  if (diet === 'keto') {
    const carbs = Math.min(KETO_CARBS_G, remaining / 4);
    return { protein, carbs: Math.round(carbs), fat: Math.round((remaining - carbs * 4) / 9) };
  }
  const fatShare = FAT_SHARE[diet];
  return {
    protein,
    fat: Math.round((remaining * fatShare) / 9),
    carbs: Math.round((remaining * (1 - fatShare)) / 4),
  };
}

/** Calories for each weekday, keeping the weekly total equal to average * 7. */
export function distributeCalories(
  average: number,
  highDays: Weekday[],
  shift: boolean,
): { calories: number; isHighDay: boolean }[] {
  const highCount = new Set(highDays).size;
  const even = WEEKDAYS.map(() => ({ calories: average, isHighDay: false }));
  if (!shift || highCount === 0 || highCount === 7) return even;

  const normal = (average * 7) / (highCount * HIGH_DAY_MULTIPLIER + (7 - highCount));
  if (normal < CALORIE_FLOOR) return even;

  return WEEKDAYS.map((day) => {
    const isHighDay = highDays.includes(day);
    return {
      calories: Math.round(isHighDay ? normal * HIGH_DAY_MULTIPLIER : normal),
      isHighDay,
    };
  });
}

export function calculateProgram(answers: ProgramAnswers): MacroProgram {
  const { profile, goal, diet, training, distribution, highDays, protein } = answers;

  const expenditure = estimateExpenditure(profile, training);
  const adjustment = dailyAdjustment(profile.weightKg, goal);
  const rawAverage = expenditure + adjustment;
  const averageCalories = Math.max(rawAverage, CALORIE_FLOOR);
  const proteinTarget = proteinGrams(profile.weightKg, protein);

  const days: DayTarget[] = distributeCalories(
    averageCalories,
    highDays,
    distribution === 'shift',
  ).map(({ calories, isHighDay }, day) => ({
    day: day as Weekday,
    calories,
    isHighDay,
    ...splitMacros(calories, proteinTarget, diet),
  }));

  return {
    expenditure,
    averageCalories,
    dailyAdjustment: averageCalories - expenditure,
    hitCalorieFloor: rawAverage < CALORIE_FLOOR,
    days,
  };
}

/** Unit helpers for the imperial inputs on the onboarding screens. */
export function poundsToKg(pounds: number): number {
  return pounds * 0.45359237;
}

export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

/** Returns an error message for an invalid profile, or null when it's valid. */
export function validateProfile(profile: BodyProfile): string | null {
  const { age, heightCm, weightKg } = profile;
  if (!Number.isFinite(age) || age < 18 || age > 100) {
    return 'Enter an age between 18 and 100.';
  }
  if (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 230) {
    return 'Enter a height between 3\'11" and 7\'6".';
  }
  if (!Number.isFinite(weightKg) || weightKg < 35 || weightKg > 300) {
    return 'Enter a weight between 77 and 660 lb.';
  }
  return null;
}
