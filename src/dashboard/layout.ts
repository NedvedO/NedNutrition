import type { ViewMode } from './metrics';

export type PageId = 'weekly' | 'energy' | 'daily';
export type SectionId = 'insights' | 'habits' | 'bodyMetrics' | 'nutrition' | 'general';
export type NutrientCardId = 'calories' | 'protein' | 'fat' | 'carbs';
export type CardId =
  | 'expenditure'
  | 'weightTrend'
  | 'weighIn'
  | 'foodLogging'
  | 'scaleWeight'
  | 'bodyFat'
  | NutrientCardId
  | 'steps';

/** How the user has arranged their dashboard. Saved on the device. */
export type DashboardLayout = {
  pages: { id: PageId; visible: boolean }[];
  sections: { id: SectionId; cards: CardId[] }[];
  nutritionModes: Record<NutrientCardId, ViewMode>;
};

export const PAGE_NAMES: Record<PageId, string> = {
  weekly: 'Weekly Nutrition',
  energy: 'Energy Balance',
  daily: 'Daily Nutrition',
};

export const SECTION_NAMES: Record<SectionId, string> = {
  insights: 'Insights & Analytics',
  habits: 'Habits',
  bodyMetrics: 'Body Metrics',
  nutrition: 'Nutrition',
  general: 'General',
};

/** What the "Add or Remove" button is called in each section. */
export const SECTION_ADD_LABELS: Record<SectionId, string> = {
  insights: 'Add or Remove Insights',
  habits: 'Add or Remove Habits',
  bodyMetrics: 'Add or Remove Metrics',
  nutrition: 'Add or Remove Nutrients',
  general: 'Add or Remove',
};

export const CARD_NAMES: Record<CardId, string> = {
  expenditure: 'Expenditure',
  weightTrend: 'Weight Trend',
  weighIn: 'Weigh-In',
  foodLogging: 'Food Logging',
  scaleWeight: 'Scale Weight',
  bodyFat: 'Visual Body Fat',
  calories: 'Calories',
  protein: 'Protein',
  fat: 'Fat',
  carbs: 'Carbs',
  steps: 'Steps',
};

/** Every card each section can show, in default order. */
export const SECTION_CARDS: Record<SectionId, CardId[]> = {
  insights: ['expenditure', 'weightTrend'],
  habits: ['weighIn', 'foodLogging'],
  bodyMetrics: ['scaleWeight', 'bodyFat'],
  nutrition: ['calories', 'protein', 'fat', 'carbs'],
  general: ['steps'],
};

const PAGE_ORDER: PageId[] = ['weekly', 'energy', 'daily'];
const SECTION_ORDER: SectionId[] = ['insights', 'habits', 'bodyMetrics', 'nutrition', 'general'];
const NUTRIENTS: NutrientCardId[] = ['calories', 'protein', 'fat', 'carbs'];

export const DEFAULT_LAYOUT: DashboardLayout = {
  pages: PAGE_ORDER.map((id) => ({ id, visible: true })),
  sections: SECTION_ORDER.map((id) => ({ id, cards: [...SECTION_CARDS[id]] })),
  nutritionModes: { calories: 'consumed', protein: 'consumed', fat: 'consumed', carbs: 'consumed' },
};

export function isNutrientCard(card: CardId): card is NutrientCardId {
  return (NUTRIENTS as CardId[]).includes(card);
}

/** Moves one item to a new position, returning a new array. */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || from >= list.length) return list;
  const target = Math.min(Math.max(to, 0), list.length - 1);
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(target, 0, item);
  return copy;
}

export function visiblePages(layout: DashboardLayout): PageId[] {
  return layout.pages.filter((p) => p.visible).map((p) => p.id);
}

/** Turns a page on or off. At least one page always stays on. */
export function togglePage(layout: DashboardLayout, id: PageId): DashboardLayout {
  const page = layout.pages.find((p) => p.id === id);
  if (page?.visible && visiblePages(layout).length === 1) return layout;
  return {
    ...layout,
    pages: layout.pages.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p)),
  };
}

export function movePage(layout: DashboardLayout, index: number, delta: -1 | 1): DashboardLayout {
  return { ...layout, pages: moveItem(layout.pages, index, index + delta) };
}

export function moveSection(
  layout: DashboardLayout,
  index: number,
  delta: -1 | 1,
): DashboardLayout {
  return { ...layout, sections: moveItem(layout.sections, index, index + delta) };
}

export function setSectionCards(
  layout: DashboardLayout,
  section: SectionId,
  cards: CardId[],
): DashboardLayout {
  return {
    ...layout,
    sections: layout.sections.map((s) => (s.id === section ? { ...s, cards } : s)),
  };
}

/** Adds a card to the end of its section, or removes it if it's already shown. */
export function toggleCard(
  layout: DashboardLayout,
  section: SectionId,
  card: CardId,
): DashboardLayout {
  const current = layout.sections.find((s) => s.id === section)?.cards ?? [];
  const cards = current.includes(card) ? current.filter((c) => c !== card) : [...current, card];
  return setSectionCards(layout, section, cards);
}

export function setNutritionMode(
  layout: DashboardLayout,
  card: NutrientCardId,
  mode: ViewMode,
): DashboardLayout {
  return { ...layout, nutritionModes: { ...layout.nutritionModes, [card]: mode } };
}

/**
 * Cleans a saved layout: drops unknown or misplaced ids and adds anything new
 * (e.g. a section added in a later version), so old saves never break the app.
 */
export function sanitizeLayout(raw: unknown): DashboardLayout {
  if (!raw || typeof raw !== 'object') return DEFAULT_LAYOUT;
  const data = raw as Partial<DashboardLayout>;

  const savedPages = Array.isArray(data.pages)
    ? data.pages.filter(
        (p, i, all) => PAGE_ORDER.includes(p?.id) && all.findIndex((q) => q?.id === p.id) === i,
      )
    : [];
  const pages = [
    ...savedPages.map((p) => ({ id: p.id, visible: p.visible !== false })),
    ...PAGE_ORDER.filter((id) => !savedPages.some((p) => p.id === id)).map((id) => ({
      id,
      visible: true,
    })),
  ];
  if (!pages.some((p) => p.visible)) pages[0] = { ...pages[0], visible: true };

  const savedSections = Array.isArray(data.sections)
    ? data.sections.filter(
        (s, i, all) => SECTION_ORDER.includes(s?.id) && all.findIndex((q) => q?.id === s.id) === i,
      )
    : [];
  const sections = [
    ...savedSections.map((s) => ({
      id: s.id,
      cards: Array.isArray(s.cards)
        ? s.cards.filter((c, i, all) => SECTION_CARDS[s.id].includes(c) && all.indexOf(c) === i)
        : [...SECTION_CARDS[s.id]],
    })),
    ...SECTION_ORDER.filter((id) => !savedSections.some((s) => s.id === id)).map((id) => ({
      id,
      cards: [...SECTION_CARDS[id]],
    })),
  ];

  const modes = { ...DEFAULT_LAYOUT.nutritionModes };
  for (const n of NUTRIENTS) {
    const mode = data.nutritionModes?.[n];
    if (mode === 'consumed' || mode === 'remaining') modes[n] = mode;
  }

  return { pages, sections, nutritionModes: modes };
}
