import {
  dailyTotals,
  goalProgress,
  isValidGoals,
  isValidServings,
  progress,
  scaleNutrients,
} from './calculations';
import type { Food, LogEntry } from './types';

const egg: Food = {
  id: 'egg',
  name: 'Egg, large',
  servingSize: 50,
  servingUnit: 'g',
  calories: 72,
  protein: 6.3,
  carbs: 0.4,
  fat: 4.8,
};

const rice: Food = {
  id: 'rice',
  name: 'White rice, cooked',
  servingSize: 1,
  servingUnit: 'cup',
  calories: 205,
  protein: 4.3,
  carbs: 44.5,
  fat: 0.4,
};

function entry(food: Food, servings: number, date = '2026-11-10'): LogEntry {
  return { id: `${food.id}-${servings}-${date}`, food, servings, meal: 'lunch', date };
}

describe('scaleNutrients', () => {
  it('multiplies every nutrient by the number of servings', () => {
    expect(scaleNutrients(egg, 2)).toEqual({ calories: 144, protein: 12.6, carbs: 0.8, fat: 9.6 });
  });

  it('supports fractional servings', () => {
    expect(scaleNutrients(rice, 1.5)).toEqual({
      calories: 307.5,
      protein: 6.5,
      carbs: 66.8,
      fat: 0.6,
    });
  });

  it.each([0, -1, NaN, Infinity])('rejects invalid servings (%p)', (servings) => {
    expect(() => scaleNutrients(egg, servings)).toThrow(RangeError);
  });
});

describe('isValidServings', () => {
  it('accepts positive numbers only', () => {
    expect(isValidServings(0.5)).toBe(true);
    expect(isValidServings(0)).toBe(false);
    expect(isValidServings(-2)).toBe(false);
    expect(isValidServings(NaN)).toBe(false);
  });
});

describe('dailyTotals', () => {
  it('returns zeros when nothing is logged', () => {
    expect(dailyTotals([], '2026-11-10')).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  });

  it('sums scaled entries for the given day', () => {
    const totals = dailyTotals([entry(egg, 2), entry(rice, 1)], '2026-11-10');
    expect(totals).toEqual({ calories: 349, protein: 16.9, carbs: 45.3, fat: 10 });
  });

  it('ignores entries from other days', () => {
    const totals = dailyTotals([entry(egg, 1), entry(rice, 1, '2026-11-09')], '2026-11-10');
    expect(totals.calories).toBe(72);
  });

  it('avoids floating point noise', () => {
    const snack: Food = { ...egg, id: 'snack', calories: 0.1, protein: 0.1, carbs: 0.1, fat: 0.1 };
    expect(dailyTotals([entry(snack, 1), entry(snack, 2)], '2026-11-10').protein).toBe(0.3);
  });
});

describe('progress', () => {
  it('shows what is left while under the goal', () => {
    expect(progress(1500, 2000)).toEqual({ consumed: 1500, goal: 2000, remaining: 500, over: 0 });
  });

  it('shows zero remaining exactly at the goal', () => {
    expect(progress(2000, 2000)).toEqual({ consumed: 2000, goal: 2000, remaining: 0, over: 0 });
  });

  it('never shows negative remaining; reports how far over instead', () => {
    expect(progress(2250, 2000)).toEqual({ consumed: 2250, goal: 2000, remaining: 0, over: 250 });
  });
});

describe('goalProgress', () => {
  it('computes progress for every nutrient', () => {
    const result = goalProgress(
      { calories: 2100, protein: 90, carbs: 200, fat: 70 },
      { calories: 2000, protein: 150, carbs: 250, fat: 70 },
    );
    expect(result.calories.over).toBe(100);
    expect(result.protein.remaining).toBe(60);
    expect(result.carbs.remaining).toBe(50);
    expect(result.fat).toEqual({ consumed: 70, goal: 70, remaining: 0, over: 0 });
  });
});

describe('isValidGoals', () => {
  it('requires every goal to be a positive number', () => {
    expect(isValidGoals({ calories: 2000, protein: 150, carbs: 250, fat: 70 })).toBe(true);
    expect(isValidGoals({ calories: 0, protein: 150, carbs: 250, fat: 70 })).toBe(false);
    expect(isValidGoals({ calories: 2000, protein: -5, carbs: 250, fat: 70 })).toBe(false);
    expect(isValidGoals({ calories: 2000, protein: 150, carbs: NaN, fat: 70 })).toBe(false);
  });
});
