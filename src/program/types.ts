export type Sex = 'male' | 'female';
export type Goal = 'lose' | 'maintain' | 'gain';
export type Diet = 'balanced' | 'lowFat' | 'lowCarb' | 'keto';
export type Training = 'none' | 'lifting' | 'cardio' | 'both';
export type Distribution = 'even' | 'shift';
export type ProteinLevel = 'low' | 'moderate' | 'high' | 'extraHigh';

/** 0 = Monday ... 6 = Sunday */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type BodyProfile = {
  sex: Sex;
  age: number; // years
  heightCm: number;
  weightKg: number;
};

export type ProgramAnswers = {
  profile: BodyProfile;
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
  /** Estimated daily energy expenditure (kcal). */
  expenditure: number;
  /** Average daily calorie target across the week (kcal). */
  averageCalories: number;
  /** Daily calorie change from expenditure for the goal (negative = deficit). */
  dailyAdjustment: number;
  /** True when the target was raised to the safety minimum. */
  hitCalorieFloor: boolean;
  days: DayTarget[];
};
