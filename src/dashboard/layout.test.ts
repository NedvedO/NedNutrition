import {
  DEFAULT_LAYOUT,
  moveItem,
  movePage,
  moveSection,
  sanitizeLayout,
  setNutritionMode,
  toggleCard,
  togglePage,
  visiblePages,
} from './layout';

describe('moveItem', () => {
  it('moves an item and keeps the rest in order', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('clamps targets past either end and ignores bad indexes', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 9)).toEqual(['b', 'c', 'a']);
    expect(moveItem(['a', 'b', 'c'], 2, -4)).toEqual(['c', 'a', 'b']);
    expect(moveItem(['a', 'b'], 5, 0)).toEqual(['a', 'b']);
  });
});

describe('pages', () => {
  it('shows all three pages by default', () => {
    expect(visiblePages(DEFAULT_LAYOUT)).toEqual(['weekly', 'energy', 'daily']);
  });

  it('turns pages off but always keeps one on', () => {
    let layout = togglePage(DEFAULT_LAYOUT, 'weekly');
    layout = togglePage(layout, 'energy');
    expect(visiblePages(layout)).toEqual(['daily']);
    expect(visiblePages(togglePage(layout, 'daily'))).toEqual(['daily']);
    expect(visiblePages(togglePage(layout, 'weekly'))).toEqual(['weekly', 'daily']);
  });

  it('reorders pages', () => {
    expect(visiblePages(movePage(DEFAULT_LAYOUT, 0, 1))).toEqual(['energy', 'weekly', 'daily']);
  });
});

describe('sections and cards', () => {
  it('moves whole sections', () => {
    const layout = moveSection(DEFAULT_LAYOUT, 4, -1);
    expect(layout.sections.map((s) => s.id)).toEqual([
      'insights',
      'habits',
      'bodyMetrics',
      'general',
      'nutrition',
    ]);
  });

  it('adds and removes cards', () => {
    const removed = toggleCard(DEFAULT_LAYOUT, 'nutrition', 'protein');
    expect(removed.sections[3].cards).toEqual(['calories', 'fat', 'carbs']);
    const added = toggleCard(removed, 'nutrition', 'protein');
    expect(added.sections[3].cards).toEqual(['calories', 'fat', 'carbs', 'protein']);
  });

  it('sets a nutrient card to show remaining', () => {
    expect(setNutritionMode(DEFAULT_LAYOUT, 'fat', 'remaining').nutritionModes.fat).toBe(
      'remaining',
    );
  });
});

describe('sanitizeLayout', () => {
  it('uses the defaults for missing or broken data', () => {
    expect(sanitizeLayout(undefined)).toEqual(DEFAULT_LAYOUT);
    expect(sanitizeLayout('nonsense')).toEqual(DEFAULT_LAYOUT);
  });

  it('keeps a valid saved layout as it is', () => {
    const layout = toggleCard(moveSection(DEFAULT_LAYOUT, 1, 1), 'habits', 'weighIn');
    expect(sanitizeLayout(JSON.parse(JSON.stringify(layout)))).toEqual(layout);
  });

  it('drops unknown or misplaced ids and adds missing ones', () => {
    const cleaned = sanitizeLayout({
      pages: [
        { id: 'energy', visible: true },
        { id: 'bogus', visible: true },
      ],
      sections: [
        { id: 'habits', cards: ['weighIn', 'calories', 'weighIn'] },
        { id: 'unknown', cards: [] },
      ],
      nutritionModes: { calories: 'remaining', fat: 'sideways' },
    });
    expect(cleaned.pages.map((p) => p.id)).toEqual(['energy', 'weekly', 'daily']);
    expect(cleaned.sections[0]).toEqual({ id: 'habits', cards: ['weighIn'] });
    expect(cleaned.sections.map((s) => s.id)).toHaveLength(5);
    expect(cleaned.nutritionModes).toMatchObject({ calories: 'remaining', fat: 'consumed' });
  });

  it('turns a page back on if every page was hidden', () => {
    const cleaned = sanitizeLayout({
      pages: [
        { id: 'weekly', visible: false },
        { id: 'energy', visible: false },
        { id: 'daily', visible: false },
      ],
    });
    expect(visiblePages(cleaned)).toEqual(['weekly']);
  });
});
