import { FEATURES, sortFeatures, type Feature } from './features';

describe('FEATURES', () => {
  it('lists features that exist today and ones that are coming', () => {
    expect(FEATURES.some((f) => f.status === 'available')).toBe(true);
    expect(FEATURES.some((f) => f.status === 'comingSoon')).toBe(true);
  });

  it('has no duplicate titles', () => {
    const titles = FEATURES.map((f) => f.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});

describe('sortFeatures', () => {
  const feature = (title: string, status: Feature['status']): Feature => ({
    title,
    status,
    description: '',
    icon: 'target',
  });

  it('puts available features first and keeps the order within each group', () => {
    const sorted = sortFeatures([
      feature('a', 'comingSoon'),
      feature('b', 'available'),
      feature('c', 'comingSoon'),
      feature('d', 'available'),
    ]);
    expect(sorted.map((f) => f.title)).toEqual(['b', 'd', 'a', 'c']);
  });
});
