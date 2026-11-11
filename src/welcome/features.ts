import type { IconName } from '../theme';

export type FeatureStatus = 'available' | 'comingSoon';

export type Feature = {
  title: string;
  description: string;
  icon: IconName;
  status: FeatureStatus;
};

/**
 * Everything NedNutrition offers or plans to offer (see docs/ROADMAP.md).
 * When a feature ships, change its status to 'available'.
 */
export const FEATURES: Feature[] = [
  {
    title: 'A macro program built for you',
    description:
      'Daily calorie, protein, fat and carb targets based on your body, your goal and your training.',
    icon: 'target',
    status: 'available',
  },
  {
    title: 'Flexible weekly calories',
    description: 'Eat more on the days you choose while your weekly total stays on track.',
    icon: 'calendar-week',
    status: 'available',
  },
  {
    title: 'Private and ad-free',
    description: 'No ads and no ad trackers. Your data stays on your phone and is never sold.',
    icon: 'lock',
    status: 'available',
  },
  {
    title: 'Fast food logging',
    description: 'Search foods, scan barcodes, and log your favorites in a couple of taps.',
    icon: 'lightning-bolt',
    status: 'comingSoon',
  },
  {
    title: 'AI meal logging',
    description: 'Take a photo or describe a meal and get its calories and macros.',
    icon: 'creation',
    status: 'comingSoon',
  },
  {
    title: 'Weight trend',
    description:
      'A smoothed trend line that filters out daily water-weight swings so you see real progress.',
    icon: 'chart-line',
    status: 'comingSoon',
  },
  {
    title: 'Adaptive coaching',
    description:
      'Weekly check-ins that estimate what you really burn and adjust your targets to match.',
    icon: 'chart-timeline-variant-shimmer',
    status: 'comingSoon',
  },
  {
    title: 'Vitamins and minerals',
    description: 'Track micronutrients against daily targets, by day, week, month or year.',
    icon: 'pill',
    status: 'comingSoon',
  },
  {
    title: 'Progress photos and measurements',
    description: 'See your progress in photos and body measurements, not just the scale.',
    icon: 'image',
    status: 'comingSoon',
  },
];

/** Available features first, then the ones coming soon, keeping the list order within each. */
export function sortFeatures(features: Feature[]): Feature[] {
  return [
    ...features.filter((f) => f.status === 'available'),
    ...features.filter((f) => f.status === 'comingSoon'),
  ];
}
