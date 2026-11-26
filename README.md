# MTRCK

MTRCK is a mobile-first Indonesian money tracker. The first scaffold milestone sets up the app shell, sketchbook design system, Firebase initialization, and development component gallery.

## Getting started

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and fill in the Firebase web app values when configuring Auth and Firestore.
3. Start the local app with `npm run dev`.
4. Open `/design` in development to review the UI primitives.

The app uses Firebase project `mtrck-13d5d`. Authentication, mandatory onboarding, profile editing, categories, transaction history, natural-language quick add, per-category budgets, payday settings, starting-balance tracking, fixed bills, and safe-to-spend are implemented. Debt tracking, hosting setup, and notifications are being added in later milestones.

## Commands

- `npm run dev` starts the Vite development server.
- `npm run lint` checks JavaScript and JSX.
- `npm test` runs the Vitest suite.
- `npm run build` creates the production bundle in `dist/`.
