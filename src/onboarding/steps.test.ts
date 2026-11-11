import { BASICS_STEPS, getSteps, sectionOf, sectionProgress } from './steps';

describe('getSteps', () => {
  it('skips picking high days when calories are spread evenly', () => {
    expect(getSteps('even')).not.toContain('highDays');
  });

  it('asks for high days right after the distribution question when shifting', () => {
    const steps = getSteps('shift');
    expect(steps.indexOf('highDays')).toBe(steps.indexOf('distribution') + 1);
  });

  it('asks all the basics first and ends with the program', () => {
    const steps = getSteps('even');
    expect(steps.slice(0, BASICS_STEPS.length)).toEqual(BASICS_STEPS);
    expect(steps[steps.length - 1]).toBe('ready');
  });
});

describe('sectionOf', () => {
  it('splits steps into basics and program', () => {
    expect(sectionOf('weight')).toBe('basics');
    expect(sectionOf('expenditure')).toBe('basics');
    expect(sectionOf('goal')).toBe('program');
  });
});

describe('sectionProgress', () => {
  const steps = getSteps('even');

  it('fills up within each section and restarts for the program', () => {
    expect(sectionProgress(steps, 0)).toBeCloseTo(1 / BASICS_STEPS.length, 5);
    expect(sectionProgress(steps, BASICS_STEPS.length - 1)).toBe(1);
    expect(sectionProgress(steps, BASICS_STEPS.length)).toBeLessThan(0.2);
    expect(sectionProgress(steps, steps.length - 1)).toBe(1);
  });

  it('is 0 for a step that does not exist', () => {
    expect(sectionProgress(steps, 99)).toBe(0);
  });
});
