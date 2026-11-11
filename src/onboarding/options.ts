import type { Option } from '../components/OptionCard';
import type {
  AthleticLevel,
  DailyActivity,
  Diet,
  Distribution,
  ExerciseSessions,
  ExperienceLevel,
  Goal,
  ProteinLevel,
  Sex,
  Training,
  WeightTrend,
  YesNoNotSure,
} from '../program/types';

// ---- Basics ----

export const SEX_OPTIONS: Option<Sex>[] = [
  { value: 'female', title: 'Female', icon: 'gender-female' },
  { value: 'male', title: 'Male', icon: 'gender-male' },
];

export const WEIGHED_MORE_OPTIONS: Option<YesNoNotSure>[] = [
  { value: 'yes', title: 'Yes', icon: 'check' },
  { value: 'no', title: 'No', icon: 'close' },
  { value: 'notSure', title: 'Not sure', icon: 'help' },
];

export const WEIGHT_TREND_OPTIONS: Option<WeightTrend>[] = [
  { value: 'losing', title: 'I’ve been losing weight', icon: 'arrow-down' },
  { value: 'gaining', title: 'I’ve been gaining weight', icon: 'arrow-up' },
  { value: 'stable', title: 'My weight has been steady', icon: 'minus' },
  { value: 'notSure', title: 'Not sure', icon: 'help' },
];

export const EXERCISE_OPTIONS: Option<ExerciseSessions>[] = [
  { value: '0', title: 'None', icon: 'calendar-blank' },
  { value: '1-3', title: '1–3 sessions a week', icon: 'calendar-today' },
  { value: '4-6', title: '4–6 sessions a week', icon: 'calendar-range' },
  { value: '7+', title: '7 or more sessions a week', icon: 'calendar-month' },
];

export const DAILY_ACTIVITY_OPTIONS: Option<DailyActivity>[] = [
  {
    value: 'sedentary',
    title: 'Mostly sitting',
    description: 'Usually under 5,000 steps a day',
    icon: 'sofa',
  },
  {
    value: 'moderate',
    title: 'On my feet some of the day',
    description: 'Usually 5,000 to 15,000 steps a day',
    icon: 'walk',
  },
  {
    value: 'veryActive',
    title: 'On my feet most of the day',
    description: 'Usually over 15,000 steps a day',
    icon: 'run',
  },
];

function experienceOptions(activity: 'lifting' | 'doing cardio'): Option<ExperienceLevel>[] {
  return [
    {
      value: 'none',
      title: 'None',
      description: `Not ${activity} right now`,
      icon: 'signal-cellular-outline',
    },
    {
      value: 'beginner',
      title: 'Beginner',
      description: `${capitalize(activity)} for a year or less`,
      icon: 'signal-cellular-1',
    },
    {
      value: 'intermediate',
      title: 'Intermediate',
      description: `${capitalize(activity)} for 1 to 4 years`,
      icon: 'signal-cellular-2',
    },
    {
      value: 'advanced',
      title: 'Advanced',
      description: `${capitalize(activity)} for 4 years or more`,
      icon: 'signal-cellular-3',
    },
  ];
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const LIFTING_OPTIONS = experienceOptions('lifting');
export const CARDIO_OPTIONS = experienceOptions('doing cardio');

export const ATHLETIC_OPTIONS: Option<AthleticLevel>[] = [
  {
    value: 'regular',
    title: 'I work out regularly',
    description: 'For fun or health, but I wouldn’t call myself an athlete',
    icon: 'whistle',
  },
  {
    value: 'athlete',
    title: 'I’m an athlete',
    description: 'I train hard and consistently for a sport or event',
    icon: 'medal',
  },
  {
    value: 'professional',
    title: 'I’m a professional athlete',
    description: 'I compete in a sport as my job',
    icon: 'trophy',
  },
];

// ---- Program ----

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
