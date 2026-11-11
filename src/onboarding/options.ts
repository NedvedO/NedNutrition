import type { Option } from '../components/OptionCard';
import type { Diet, Distribution, Goal, ProteinLevel, Training } from '../program/types';

export const GOAL_OPTIONS: Option<Goal>[] = [
  {
    value: 'lose',
    title: 'Lose weight',
    description: 'About 0.5% of your body weight per week',
    icon: 'trending-down',
  },
  {
    value: 'maintain',
    title: 'Maintain weight',
    description: 'Keep your weight steady',
    icon: 'trending-neutral',
  },
  {
    value: 'gain',
    title: 'Gain weight',
    description: 'About 0.25% of your body weight per week, to build muscle',
    icon: 'trending-up',
  },
];

export const DIET_OPTIONS: Option<Diet>[] = [
  {
    value: 'balanced',
    title: 'Balanced',
    description: 'An even mix of carbs and fat',
    icon: 'scale-balance',
  },
  {
    value: 'lowFat',
    title: 'Low-fat',
    description: 'Less fat, leaving more room for carbs',
    icon: 'bread-slice',
  },
  {
    value: 'lowCarb',
    title: 'Low-carb',
    description: 'Fewer carbs, leaving more room for fat',
    icon: 'fish',
  },
  {
    value: 'keto',
    title: 'Keto',
    description: 'Carbs kept under 30 g a day, most energy from fat',
    icon: 'egg-fried',
  },
];

export const TRAINING_OPTIONS: Option<Training>[] = [
  { value: 'none', title: 'None or light activity', icon: 'meditation' },
  { value: 'lifting', title: 'Lifting', icon: 'dumbbell' },
  { value: 'cardio', title: 'Cardio', icon: 'run-fast' },
  { value: 'both', title: 'Cardio and lifting', icon: 'check-all' },
];

export const DISTRIBUTION_OPTIONS: Option<Distribution>[] = [
  {
    value: 'even',
    title: 'Same every day',
    description: 'Every day of the week has the same calorie target',
    icon: 'menu',
  },
  {
    value: 'shift',
    title: 'Higher on some days',
    description: 'Eat more on the days you pick and a little less on the rest',
    icon: 'waves',
  },
];

export const PROTEIN_OPTIONS: Option<ProteinLevel>[] = [
  {
    value: 'low',
    title: 'Low',
    description: 'About 0.7 g per pound of body weight',
    icon: 'peanut',
  },
  {
    value: 'moderate',
    title: 'Moderate',
    description: 'About 0.85 g per pound of body weight',
    icon: 'egg',
  },
  {
    value: 'high',
    title: 'High',
    description: 'About 1 g per pound of body weight',
    icon: 'hamburger',
  },
  {
    value: 'extraHigh',
    title: 'Very high',
    description: 'About 1.15 g per pound of body weight',
    icon: 'food-steak',
  },
];
