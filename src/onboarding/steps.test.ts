import { getSteps, stepProgress } from './steps';

describe('getSteps', () => {
  it('skips picking high days when calories are spread evenly', () => {
    expect(getSteps('even')).not.toContain('highDays');
  });

  it('asks for high days right after the distribution question when shifting', () => {
    const steps = getSteps('shift');
    expect(steps.indexOf('highDays')).toBe(steps.indexOf('distribution') + 1);
  });

  it('always starts with the user and ends with the program', () => {
    for (const distribution of ['even', 'shift'] as const) {
      const steps = getSteps(distribution);
      expect(steps[0]).toBe('about');
      expect(steps[steps.length - 1]).toBe('ready');
    }
  });
});

describe('stepProgress', () => {
  it('goes from empty on the first step to full on the last', () => {
    expect(stepProgress(0, 8)).toBe(0);
    expect(stepProgress(7, 8)).toBe(1);
    expect(stepProgress(2, 5)).toBe(0.5);
  });

  it('stays between 0 and 1', () => {
    expect(stepProgress(-1, 5)).toBe(0);
    expect(stepProgress(9, 5)).toBe(1);
    expect(stepProgress(0, 1)).toBe(1);
  });
});
