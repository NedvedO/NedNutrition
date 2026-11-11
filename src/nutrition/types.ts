export type Nutrients = {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
};

export type Food = Nutrients & {
  id: string;
  name: string;
  servingSize: number;
  servingUnit: string;
};

export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type LogEntry = {
  id: string;
  /** Snapshot of the food at the time it was logged, so past logs never change. */
  food: Food;
  servings: number;
  meal: Meal;
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
};

export type Goals = Nutrients;

export type NutrientProgress = {
  consumed: number;
  goal: number;
  /** How much is left before reaching the goal; 0 once the goal is reached. */
  remaining: number;
  /** How far past the goal; 0 while under the goal. */
  over: number;
};
