# MTRCK

MTRCK is a mobile-first Indonesian money tracker. The first scaffold milestone sets up the app shell, sketchbook design system, Firebase initialization, and development component gallery.

## Getting started

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and fill in the Firebase web app values when configuring Auth and Firestore.
3. Start the local app with `npm run dev`.
4. Open `/design` in development to review the UI primitives.

The app uses Firebase project `mtrck-13d5d`. Authentication, mandatory onboarding, profile editing, categories, transaction history, natural-language quick add, per-category budgets, payday settings, starting-balance tracking, fixed bills, safe-to-spend, debt payments, split bills, WhatsApp reminders, and scheduled push notification support are implemented.

## Deploying to Firebase Hosting

1. Install the Firebase CLI and authenticate with `firebase login`.
2. Configure the Firebase web app keys in `.env` using `.env.example` as a template.
3. Deploy the database rules, indexes, and web app with `firebase deploy --only firestore:rules,firestore:indexes,hosting`.

Hosting builds the production app before upload. The `.firebaserc` target is the MTRCK project `mtrck-13d5d`.

## Push notifications and Cloud Functions

Web Push requires HTTPS, browser notification permission, and a Firebase Cloud Messaging Web Push certificate. In Firebase Console, open **Project settings → Cloud Messaging → Web Push certificates**, generate a key pair, and set its public key as `VITE_FIREBASE_VAPID_KEY` in `.env`. Firebase web app configuration remains in the `VITE_FIREBASE_*` variables; web app config values are public client identifiers, not server credentials.

Deploy scheduled functions with `firebase deploy --only functions`. The project must use the Firebase **Blaze** plan with Cloud Billing enabled for scheduled Cloud Functions. The function runs hourly and checks each enabled reminder slot in the user's timezone.

Run `npm --prefix functions install` once after cloning to install the Cloud Functions dependencies. Run `npm run sync:domain` after changing a shared domain file. The Functions predeploy hook runs this copy step and the Functions lint and test checks. To load the local function with Firestore data isolated from production, run `firebase emulators:start --only functions,firestore --project demo-mtrck`; inspect the Functions and Firestore emulator logs while using a `demo-` project ID. The emulator does not deliver push messages to a real device, so verify delivery with a registered test browser after deploying to a Firebase project.

On iPhone or iPad Safari, add MTRCK to the Home Screen before enabling web push. Browser permission prompts are only requested after selecting **Aktifkan** in the app.

## Commands

- `npm run dev` starts the Vite development server.
- `npm run lint` checks JavaScript and JSX.
- `npm test` runs the Vitest suite.
- `npm run build` creates the production bundle in `dist/`.
