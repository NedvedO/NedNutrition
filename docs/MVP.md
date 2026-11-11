# NedNutrition MVP

## Problem and user

A person who wants to hit daily calorie and macro targets (protein, carbs, fat)
and needs a quick way to log what they eat from their phone.

## In scope (v1)

### US-1: Search for a food

As a user, I want to search for a food by name so that I can find its nutrition facts.

- Typing at least 2 characters shows matching foods from the food database.
- Each result shows name, serving size, and calories per serving.
- If the search fails (no network, API error), a clear message is shown instead of a crash.
- If nothing matches, the app says "No foods found."

### US-2: Log a food

As a user, I want to add a food to today's log with a quantity and a meal
so that my totals reflect what I ate.

- I choose a meal: breakfast, lunch, dinner, or snack.
- I enter the number of servings (decimals allowed, e.g. 1.5; must be greater than 0).
- After saving, the entry appears under that meal on today's screen.
- I can delete an entry I logged by mistake.

### US-3: See daily totals

As a user, I want to see today's calories, protein, carbs, and fat compared to
my goals so that I know what I have left.

- Totals are the sum of all entries for the selected day, scaled by servings.
- Each nutrient shows consumed / goal and remaining.
- Going over a goal is shown clearly (remaining is never shown as a negative number;
  it shows "over by X" instead).
- I can move to previous days to see their logs.

### US-4: Set my goals

As a user, I want to set my daily calorie and macro goals so that the totals
are compared against my own targets.

- Starting goals come from the onboarding questions (see [ROADMAP.md](ROADMAP.md), Phase 1);
  I can override any of them with my own numbers.
- Goals must be positive numbers; invalid input is rejected with a message.
- Goals persist after closing and reopening the app.

## Out of scope for v1

- Accounts, login, cloud sync (data stays on the device)
- Barcode scanning
- Custom foods and recipes
- Meal plans, AI photo recognition, social features
- Micronutrients (vitamins, minerals)

## Data model

| Entity     | Fields                                                                          |
| ---------- | ------------------------------------------------------------------------------- |
| `Food`     | id, name, servingSize, servingUnit, calories, protein, carbs, fat (per serving) |
| `LogEntry` | id, food (snapshot), servings, meal, date (YYYY-MM-DD)                          |
| `Goals`    | calories, protein, carbs, fat (per day)                                         |

A `LogEntry` stores a snapshot of the food's nutrition, so past logs don't change
if the food database changes later.

## Food data source

USDA FoodData Central API (free, requires an API key). The key must never be
committed; it lives in a local `.env` file that is git-ignored.

## Principles

- Nutrition maths (scaling servings, daily totals, goal progress) lives in plain
  TypeScript functions in `src/nutrition/`, separate from the UI, with unit tests.
- Collect as little personal data as possible. Everything is stored on the device.
- No medical advice: show numbers, let the user set their own goals.
