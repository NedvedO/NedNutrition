export type Sex = 'male' | 'female';
export type Goal = 'lose' | 'maintain' | 'gain';
export type Diet = 'balanced' | 'lowFat' | 'lowCarb' | 'keto';
export type Training = 'none' | 'lifting' | 'cardio' | 'both';
export type Distribution = 'even' | 'shift';
export type ProteinLevel = 'low' | 'moderate' | 'high' | 'extraHigh';

export type ExerciseSessions = '0' | '1-3' | '4-6' | '7+';
export type DailyActivity = 'sedentary' | 'moderate' | 'veryActive';
export type AthleticLevel = 'regular' | 'athlete' | 'professional';
export type ExperienceLevel = 'none' | 'beginner' | 'intermediate' | 'advanced';
export type YesNoNotSure = 'yes' | 'no' | 'notSure';
export type WeightTrend = 'losing' | 'gaining' | 'stable' | 'notSure';

/** 0 = Monday ... 6 = Sunday */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type BodyProfile = {
  sex: Sex;
  age: number; // years
  heightCm: number;
  weightKg: number;
  /** Estimated body fat, or null when the user isn't sure. */
  bodyFatPercent: number | null;
};

export type ActivityProfile = {
  exerciseSessions: ExerciseSessions;
  dailyActivity: DailyActivity;
  athleticLevel: AthleticLevel;
};

/**
 * Answers that don't change the numbers yet. They're saved on the phone
 * for adaptive coaching (roadmap phase 5).
 */
export type HistoryProfile = {
  weighedMore: YesNoNotSure;
  recentTrend: WeightTrend;
  liftingExperience: ExperienceLevel;
  cardioExperience: ExperienceLevel;
};

export type ProgramAnswers = {
  profile: BodyProfile;
  activity: ActivityProfile;
  history: HistoryProfile;
  /** Expenditure the user typed in themselves, replacing the estimate. */
  expenditureOverride: number | null;
  goal: Goal;
  diet: Diet;
  training: Training;
  distribution: Distribution;
  highDays: Weekday[];
  protein: ProteinLevel;
};

export type DayTarget = {
  day: Weekday;
  calories: number;
  protein: number; // grams
  fat: number; // grams
  carbs: number; // grams
  isHighDay: boolean;
};

export type MacroProgram = {
  /** Daily energy expenditure used for the program (kcal). */
  expenditure: number;
  /** True when the user typed in their own expenditure. */
  expenditureIsCustom: boolean;
  /** Average daily calorie target across the week (kcal). */
  averageCalories: number;
  /** Daily calorie change from expenditure for the goal (negative = deficit). */
  dailyAdjustment: number;
  /** True when the target was raised to the safety minimum. */
  hitCalorieFloor: boolean;
  days: DayTarget[];
};
