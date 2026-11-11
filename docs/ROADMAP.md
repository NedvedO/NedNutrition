# NedNutrition Roadmap

Long-term goal: a full-featured nutrition coach that builds a personal macro
program and adapts it over time. We build this in phases; each phase ships a
working app.

All branding, wording, and visuals are NedNutrition's own. Other apps can
inspire features and UX patterns, but we don't copy their names, marketing
copy, or artwork.

## Phase 1: Onboarding and macro program (in progress)

- Welcome carousel introducing the app
- Basics: sex, birthday, height, weight, weight history, body fat, exercise,
  daily activity, training experience, athletic level, then an editable
  expenditure estimate (Katch-McArdle with body fat, otherwise Mifflin-St Jeor)
- Program: goal, diet style, training, weekly calorie distribution, protein
- Answers and program saved on the device; "Delete my data" erases them
- Calculated weekly macro program (calories, protein, fat, carbs per day)
  with an explanation of how it was built
- Dashboard: weekly nutrition, energy balance and daily nutrition pages,
  insights, habits, body metrics and nutrition cards; tab bar with Strategy
  (current program, redo setup) and More (units, delete my data). Cards that
  need food logging, weigh-ins or Health sync show zeros or "Coming soon"
- Customize Dashboard: show/hide and reorder the top pages, reorder sections,
  drag cards within a section, add or remove cards, Consumed/Remaining per
  nutrient card, reset to defaults

## Phase 2: Food logging (the MVP in [MVP.md](MVP.md))

- Food search (USDA FoodData Central)
- Log foods per meal with servings
- Daily totals vs. that day's targets
- Save data on the device

## Phase 3: Faster logging

- Barcode scanning (Open Food Facts)
- Favorites and recent foods
- Quick add (type calories/macros directly)
- Custom foods and recipes

## Phase 4: Weight and trends

- Daily weigh-ins
- Smoothed trend weight (e.g. exponentially weighted moving average) so daily
  water swings don't hide real progress
- Weight trend chart (1W / 1M / 3M / 6M / 1Y / All)

## Phase 5: Adaptive coaching

- Estimate real energy expenditure from logged intake and trend weight
- Weekly check-in that adjusts targets based on progress toward the goal
- Expenditure chart with an uncertainty range

## Phase 6: Deeper nutrition

- Micronutrients (vitamins, minerals) with targets and % progress
- Nutrition overview by day / week / month / year

## Phase 7: Extras

- AI photo logging (describe or photograph a meal to log it)
- Apple Health / Health Connect sync (needs a development build, not Expo Go)
- Progress photos and body measurements
- Accounts and cloud sync across devices

## Safety principles (all phases)

- Calorie targets never go below a safe minimum (1,200 kcal/day).
- Targets are estimates, not medical advice; the app says so.
- Health data stays private: no ads, no ad trackers, minimal data collection.
