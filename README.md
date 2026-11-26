# MTRCK

MTRCK is a mobile-first Indonesian money tracker. The first scaffold milestone sets up the app shell, sketchbook design system, Firebase initialization, and development component gallery.

## Getting started

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and fill in the Firebase web app values when configuring Auth and Firestore.
3. Start the local app with `npm run dev`.
4. Open `/design` in development to review the UI primitives.

The app uses Firebase project `mtrck-13d5d`. Authentication, mandatory onboarding, profile editing, categories, transaction history, natural-language quick add, per-category budgets, payday settings, starting-balance tracking, fixed bills, safe-to-spend, debt payments, split bills, and WhatsApp reminders are implemented. Firebase Hosting and Firestore security configuration are ready; scheduled notifications are being added in the final milestone.

## Deploying to Firebase Hosting

1. Install the Firebase CLI and authenticate with `firebase login`.
2. Configure the Firebase web app keys in `.env` using `.env.example` as a template.
3. Deploy the database rules, indexes, and web app with `firebase deploy --only firestore:rules,firestore:indexes,hosting`.

Hosting builds the production app before upload. The `.firebaserc` target is the MTRCK project `mtrck-13d5d`.

## Commands

- `npm run dev` starts the Vite development server.
- `npm run lint` checks JavaScript and JSX.
- `npm test` runs the Vitest suite.
- `npm run build` creates the production bundle in `dist/`.
