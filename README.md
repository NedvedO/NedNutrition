# NedNutrition

A mobile app for logging food and tracking daily calories and macros
(protein, carbs, fat) against your own goals.

Built with React Native (Expo) and TypeScript. Food data comes from the
USDA FoodData Central API.

See [docs/ROADMAP.md](docs/ROADMAP.md) for where the app is headed and
[docs/MVP.md](docs/MVP.md) for the first release's user stories and data model.

## Status

Phase 1: welcome screens, consent, and onboarding questions that build a
weekly macro program, then a dashboard. Answers are saved on the device. Food logging comes next.

## Running it

Requires Node.js LTS.

```bash
npm install
npm start        # then scan the QR code with the Expo Go app on your phone
npm run web      # or open it in a browser
```

Checks (the same ones CI runs):

```bash
npm test
npm run lint
npm run typecheck
npm run format:check
```

## Development workflow

- `main` always works. Do your work on a feature branch and open a pull request.
- Every pull request runs lint and tests in CI and must pass before merging.
- Keep pull requests small: one user story or fix per PR.
- Never commit API keys or other secrets.
