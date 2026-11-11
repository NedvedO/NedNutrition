import {
  CALORIE_FLOOR,
  calculateProgram,
  dailyAdjustment,
  distributeCalories,
  estimateExpenditure,
  feetInchesToCm,
  poundsToKg,
  proteinGrams,
  restingEnergy,
  splitMacros,
  validateProfile,
} from './calculateProgram';
import type { BodyProfile, ProgramAnswers } from './types';

const profile: BodyProfile = { sex: 'male', age: 25, heightCm: 178, weightKg: 70 };

const answers: ProgramAnswers = {
  profile,
  goal: 'lose',
  diet: 'balanced',
  training: 'lifting',
  distribution: 'even',
  highDays: [],
  protein: 'moderate',
};

describe('restingEnergy', () => {
  it('uses Mifflin-St Jeor for men and women', () => {
    // 10*70 + 6.25*178 - 5*25 = 1687.5, then +5 for men or -161 for women
    expect(restingEnergy(profile)).toBe(1692.5);
    expect(restingEnergy({ ...profile, sex: 'female' })).toBe(1526.5);
  });
});

describe('estimateExpenditure', () => {
  it('scales resting energy by training', () => {
    expect(estimateExpenditure(profile, 'none')).toBe(2200);
    expect(estimateExpenditure(profile, 'both')).toBe(2708);
  });
});

describe('dailyAdjustment', () => {
  it('is a deficit for losing, zero for maintaining, a surplus for gaining', () => {
    expect(dailyAdjustment(70, 'lose')).toBe(-385);
    expect(dailyAdjustment(70, 'maintain')).toBe(0);
    expect(dailyAdjustment(70, 'gain')).toBe(193);
  });
});

describe('proteinGrams', () => {
  it('scales with body weight and preference', () => {
    expect(proteinGrams(70, 'low')).toBe(112);
    expect(proteinGrams(70, 'extraHigh')).toBe(175);
  });
});

describe('splitMacros', () => {
  it('fills the remaining calories with fat and carbs', () => {
    // 2000 - 150*4 = 1400 left; balanced: 40% fat, 60% carbs
    expect(splitMacros(2000, 150, 'balanced')).toEqual({ protein: 150, fat: 62, carbs: 210 });
  });

  it('gives low-fat less fat than low-carb', () => {
    const lowFat = splitMacros(2000, 150, 'lowFat');
    const lowCarb = splitMacros(2000, 150, 'lowCarb');
    expect(lowFat.fat).toBeLessThan(lowCarb.fat);
    expect(lowFat.carbs).toBeGreaterThan(lowCarb.carbs);
  });

  it('caps carbs at 30 g on keto', () => {
    expect(splitMacros(2000, 150, 'keto')).toEqual({ protein: 150, carbs: 30, fat: 142 });
  });

  it('never returns negative fat or carbs when protein uses every calorie', () => {
    expect(splitMacros(500, 200, 'balanced')).toEqual({ protein: 200, fat: 0, carbs: 0 });
  });
});

describe('distributeCalories', () => {
  const total = (days: { calories: number }[]) => days.reduce((sum, d) => sum + d.calories, 0);

  it('gives every day the average when distributing evenly', () => {
    const days = distributeCalories(2000, [0, 1], false);
    expect(days.every((d) => d.calories === 2000 && !d.isHighDay)).toBe(true);
  });

  it('raises high days and keeps the weekly total about the same', () => {
    const days = distributeCalories(2000, [0, 1, 3, 4, 5], true);
    expect(days[0].isHighDay).toBe(true);
    expect(days[2].isHighDay).toBe(false);
    expect(days[0].calories).toBeGreaterThan(days[2].calories);
    expect(Math.abs(total(days) - 14000)).toBeLessThanOrEqual(7);
  });

  it('falls back to even when no days or every day is high', () => {
    expect(new Set(distributeCalories(2000, [], true).map((d) => d.calories)).size).toBe(1);
    expect(
      new Set(distributeCalories(2000, [0, 1, 2, 3, 4, 5, 6], true).map((d) => d.calories)).size,
    ).toBe(1);
  });

  it('falls back to even rather than pushing normal days below the floor', () => {
    const days = distributeCalories(CALORIE_FLOOR, [0, 1, 2], true);
    expect(days.every((d) => d.calories === CALORIE_FLOOR)).toBe(true);
  });
});

describe('calculateProgram', () => {
  it('builds seven days of targets', () => {
    const program = calculateProgram(answers);
    expect(program.expenditure).toBe(2454);
    expect(program.averageCalories).toBe(2069);
    expect(program.dailyAdjustment).toBe(-385);
    expect(program.hitCalorieFloor).toBe(false);
    expect(program.days).toHaveLength(7);
    expect(program.days[0]).toMatchObject({ calories: 2069, protein: 133 });
  });

  it('never targets less than the calorie floor', () => {
    const small: ProgramAnswers = {
      ...answers,
      profile: { sex: 'female', age: 70, heightCm: 150, weightKg: 45 },
      training: 'none',
    };
    const program = calculateProgram(small);
    expect(program.averageCalories).toBe(CALORIE_FLOOR);
    expect(program.hitCalorieFloor).toBe(true);
    expect(program.days.every((d) => d.calories >= CALORIE_FLOOR)).toBe(true);
  });
});

describe('unit conversion', () => {
  it('converts pounds and feet/inches', () => {
    expect(poundsToKg(154)).toBeCloseTo(69.85, 2);
    expect(feetInchesToCm(5, 10)).toBeCloseTo(177.8, 1);
  });
});

describe('validateProfile', () => {
  it('accepts a normal adult profile', () => {
    expect(validateProfile(profile)).toBeNull();
  });

  it('rejects out-of-range or missing values', () => {
    expect(validateProfile({ ...profile, age: 15 })).toMatch(/age/);
    expect(validateProfile({ ...profile, heightCm: NaN })).toMatch(/height/);
    expect(validateProfile({ ...profile, weightKg: 20 })).toMatch(/weight/);
  });
});
