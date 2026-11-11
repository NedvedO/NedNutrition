import type { Food, LogEntry } from '../nutrition/types';
import { calculateProgram } from '../program/calculateProgram';
import type { ProgramAnswers } from '../program/types';
import {
  barFraction,
  countThisWeek,
  displayWeight,
  energyBalance,
  entriesSince,
  habitGrid,
  loggedDates,
  remainingAmount,
  trendWeights,
  weekSummary,
} from './metrics';

const today = new Date(2026, 10, 10); // Tuesday 10 Nov 2026

const answers: ProgramAnswers = {
  profile: { sex: 'male', age: 25, heightCm: 178, weightKg: 70, bodyFatPercent: null },
  activity: { exerciseSessions: '1-3', dailyActivity: 'moderate', athleticLevel: 'regular' },
  history: {
    weighedMore: 'no',
    recentTrend: 'stable',
    liftingExperience: 'none',
    cardioExperience: 'none',
  },
  expenditureOverride: null,
  goal: 'lose',
  diet: 'balanced',
  training: 'lifting',
  distribution: 'shift',
  highDays: [5, 6],
  protein: 'moderate',
};
const program = calculateProgram(answers);

const oats: Food = {
  id: 'oats',
  name: 'Oats',
  servingSize: 40,
  servingUnit: 'g',
  calories: 150,
  protein: 5,
  carbs: 27,
  fat: 3,
};

function eat(date: string, servings: number): LogEntry {
  return { id: `${date}-${servings}`, food: oats, servings, meal: 'breakfast', date };
}

describe('weekSummary', () => {
  it('covers Monday to Sunday and marks today and future days', () => {
    const week = weekSummary(program, [eat('2026-11-10', 2)], today);
    expect(week.map((d) => d.date)).toEqual([
      '2026-11-09',
      '2026-11-10',
      '2026-11-11',
      '2026-11-12',
      '2026-11-13',
      '2026-11-14',
      '2026-11-15',
    ]);
    expect(week[1]).toMatchObject({ isToday: true, isFuture: false });
    expect(week[1].consumed.calories).toBe(300);
    expect(week[2].isFuture).toBe(true);
    expect(week[5].target.isHighDay).toBe(true);
  });
});

describe('bars', () => {
  it('fills by the share eaten or the share left', () => {
    expect(barFraction(500, 2000, 'consumed')).toBe(0.25);
    expect(barFraction(500, 2000, 'remaining')).toBe(0.75);
  });

  it('stays between 0 and 1', () => {
    expect(barFraction(2500, 2000, 'consumed')).toBe(1);
    expect(barFraction(2500, 2000, 'remaining')).toBe(0);
    expect(barFraction(10, 0, 'consumed')).toBe(0);
  });

  it('never reports a negative amount remaining', () => {
    expect(remainingAmount(500, 2000)).toBe(1500);
    expect(remainingAmount(2500, 2000)).toBe(0);
  });
});

describe('habits', () => {
  const dates = loggedDates([eat('2026-11-09', 1), eat('2026-11-10', 1), eat('2026-11-02', 1)]);

  it('builds a 30-day grid ending today', () => {
    const grid = habitGrid(dates, today);
    expect(grid).toHaveLength(30);
    expect(grid[29]).toBe(true); // today
    expect(grid[28]).toBe(true); // yesterday
    expect(grid[27]).toBe(false);
  });

  it('counts only this week', () => {
    expect(countThisWeek(dates, today)).toBe(2);
  });
});

describe('weight', () => {
  it('smooths scale weight into a trend', () => {
    const trend = trendWeights([
      { date: '2026-11-08', kg: 70 },
      { date: '2026-11-09', kg: 72 },
    ]);
    expect(trend[0].kg).toBe(70);
    expect(trend[1].kg).toBeCloseTo(70.2, 5);
  });

  it('shows weight in the chosen unit', () => {
    expect(displayWeight(74.39, 'lb')).toBe(164);
    expect(displayWeight(74.39, 'kg')).toBe(74.4);
  });

  it('keeps entries from the last few days only', () => {
    const entries = [
      { date: '2026-11-01', kg: 70 },
      { date: '2026-11-05', kg: 70 },
      { date: '2026-11-10', kg: 70 },
    ];
    expect(entriesSince(entries, today, 7).map((e) => e.date)).toEqual([
      '2026-11-05',
      '2026-11-10',
    ]);
  });
});

describe('energyBalance', () => {
  it('shows N/A for nutrition until food is logged', () => {
    const balance = energyBalance(program, [], today, 'expenditure');
    expect(balance.nutritionAverage).toBeNull();
    expect(balance.difference).toBeNull();
    expect(balance.reference).toBe(program.expenditure);
    expect(balance.referenceSeries).toHaveLength(30);
  });

  it('averages logged days only and compares with expenditure', () => {
    const balance = energyBalance(
      program,
      [eat('2026-11-09', 10), eat('2026-11-10', 12)],
      today,
      'expenditure',
    );
    expect(balance.nutritionAverage).toBe(1650);
    expect(balance.difference).toBe(1650 - program.expenditure);
    expect(balance.nutritionSeries.filter((c) => c !== null)).toEqual([1500, 1800]);
  });

  it('follows the weekly targets, including higher days', () => {
    const balance = energyBalance(program, [], today, 'targets');
    expect(new Set(balance.referenceSeries).size).toBe(2);
    expect(Math.abs(balance.reference - program.averageCalories)).toBeLessThan(25);
  });
});
