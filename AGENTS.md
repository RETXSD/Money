# AGENTS.md: Money Tracker (working title)

> Read this whole file before writing any code.
> Work **one milestone at a time** (see section 10). After each milestone: run the checks, commit, summarize, and **stop** until asked to continue.

---

## 1. Product overview

A web-based personal money tracker for Indonesian users (students, freelancers, young workers). It must NOT be a generic expense tracker. Three differentiators:

1. **Natural-language quick add**: typing `beli kopi 25rb` or `gajian 5jt` creates a complete transaction (amount, type, category, date).
2. **Debts and split bill**: track who owes me / whom I owe, split a bill among people.
3. **Safe-to-spend**: answers "how much can I spend per day until payday?"

Plus **per-category budgets** (envelope style, e.g. Makan Rp 800.000, Jajan Rp 300.000) that tie into safe-to-spend.

Plus **personalized push reminders** three times a day (morning, noon, evening) and a birthday greeting (see section 6.8).

- UI language: **Indonesian**. Code, comments, commit messages: **English**.
- Currency: **IDR**, integers only, no decimals.
- Mobile-first, responsive (the main use is on a phone browser).

---

## 2. Tech stack

- React + Vite, **plain JavaScript (ES modules)**, JSDoc for types on shared functions.
- React Router (`react-router-dom`).
- Firebase modular SDK (v10+): **Auth** (Google sign-in + email/password) and **Firestore**
  Project name : MTRCK
  Project ID : mtrck-13d5d
  Project number : 1027781525034.
- Tailwind CSS v4 (via `@tailwindcss/vite`), themed with the hand-drawn design system in section 4a.
- Fonts: `@fontsource/patrick-hand` and `@fontsource/caveat-brush` (self-hosted, no external font requests).
- `date-fns` for date logic.
- Tests: Vitest + React Testing Library.
- Lint/format: ESLint + Prettier.
- Hosting: Firebase Hosting (Milestone 7).
- Notifications (Milestone 8): Firebase Cloud Messaging (web push) + one scheduled Cloud Function (Node 20, `firebase-functions` v2, `firebase-admin`).

Do not add other dependencies unless clearly needed; if you add one, say why in the commit message.

Cloud Functions are used ONLY for the scheduled notifications in Milestone 8. No payments and no AI calls in v1 (see section 11).

---

## 3. Folder structure

```
src/
  app/
    App.jsx
    router.jsx
    providers/AuthProvider.jsx
  features/
    auth/
    transactions/
    categories/
    budgets/
    quick-add/          # parseQuickAdd.js (pure) + UI
    debts/
    safe-to-spend/      # calculateSafeToSpend.js (pure) + hook + card
    dashboard/
    notifications/      # FCM client + settings UI (Milestone 8)
  lib/
    firebase.js         # initialization only
  shared/
    components/         # Button, Modal, EmptyState, MoneyText, ...
    utils/              # money.js, dates.js, phone.js
    constants/
  styles/
```

Also at the repo root (Milestone 8): `functions/` (Cloud Functions), `public/firebase-messaging-sw.js`, and `scripts/sync-domain.mjs`.

Inside each feature: `components/`, `hooks/`, `<feature>.service.js`, `*.test.js`, `index.js` (public exports only).

---

## 4. Clean code rules (strict)

1. **Layering**: components -> hooks -> services -> Firebase. Components and hooks NEVER import from `firebase/*` directly. Only `*.service.js` files and `lib/firebase.js` do.
2. **Pure domain logic**: parsing, safe-to-spend, budget math, split bill math, and date-cycle math are **pure functions** with no Firebase, no React, no `Date.now()` inside (pass `today` as an argument). Each has unit tests.
3. **Money is an integer in rupiah.** Never use floats for money. Format only at the UI edge with `formatRupiah()` from `shared/utils/money.js` (`Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })`).
4. Small functions, one responsibility, descriptive names. No magic numbers or strings: put them in `shared/constants/`.
5. Services return plain JS objects (convert Firestore `Timestamp` to `Date` in the service), never raw snapshots.
6. Hooks expose `{ data, loading, error }` and subscribe with `onSnapshot` where realtime matters (transactions, debts); clean up listeners.
7. Handle loading, empty, and error states in every screen. Show Indonesian error messages.
8. No `console.log` in committed code. No commented-out code.
9. Secrets via `.env` (`VITE_FIREBASE_*`). Commit `.env.example`, never `.env`.
10. Prefer composition over big components; a component file over ~150 lines should be split.

---

## 4a. UI design system: hand-drawn theme

**Look and feel**: a sketchbook / notebook-doodle style, like pen and marker on paper. Thick black outlines, slightly wobbly shapes, hard offset shadows, highlighter-style accents. Playful but still clean and readable; money numbers must always be easy to read.

**Palette**: only these six colors. In `@theme` reset Tailwind's default palette (`--color-*: initial;`) so nothing else can be used.

| Token           | Hex                                         | Role                                                          |
| --------------- | ------------------------------------------- | ------------------------------------------------------------- |
| `paper` (white) | `#FFFDF7` page, `#FFFFFF` cards             | backgrounds                                                   |
| `ink` (black)   | `#1A1A1A`                                   | text, borders, shadows                                        |
| `yellow`        | `#FFD93D`                                   | primary buttons, highlights, warnings, the safe-to-spend card |
| `red`           | `#FF6B6B` (`red-dark` `#B91C1C` for text)   | expenses, over budget, danger/delete                          |
| `green`         | `#6BCB77` (`green-dark` `#15803D` for text) | income, receivables (owed to me), on-track budget             |
| `blue`          | `#4D96FF` (`blue-dark` `#1D4ED8` for text)  | info, links, focus ring, selected state                       |

Rules:

- Text on colored fills is always `ink`. Colored text on paper must use the `-dark` variants.
- Every text/background pair meets WCAG AA (4.5:1).
- Light theme only in v1.
- Semantic mapping: income = green, expense = red, piutang (owed to me) = green, utang (I owe) = red, warning = yellow, info/selected = blue. Budget progress: green under 75%, yellow 75-100%, red over.

**Typography**: headings in `Caveat Brush`, body and UI in `Patrick Hand`, fallback `ui-rounded, system-ui, sans-serif`. Base size 17px. Amounts are bold and larger than their labels. Never set long paragraphs in the heading font.

**Hand-drawn techniques** (CSS and SVG only):

- Borders: `2.5px solid var(--color-ink)` with an irregular radius such as `border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px`. Define a few variants (`--radius-sketch-a/b/c`) and vary them between components so the UI does not look stamped.
- Shadows: hard offset, no blur (`4px 4px 0 var(--color-ink)`). Pressed state: translate 2px and shadow 2px.
- Background: paper with a faint dot or grid pattern (`radial-gradient`). Cards are white sheets or yellow "sticky notes". Decorative cards may rotate up to 1deg; never rotate forms, inputs, or text-heavy blocks.
- Optional wobble: one SVG `feTurbulence` + `feDisplacementMap` filter (scale 2 or less) for decorative shapes and illustrations only, never on text or inputs.
- Dividers: dashed or squiggle lines (SVG background), not plain 1px lines.
- Key numbers (e.g. the daily allowance): marker-style yellow highlight or hand-drawn underline via CSS gradient or SVG.
- Progress bars: thick outline with a diagonal-hatch fill (`repeating-linear-gradient`) in the status color.
- Icons: inline SVG doodles in `shared/components/icons/` (stroke 2.5, round caps and joins, slightly uneven paths). Category icons stay emoji.
- Illustrations (onboarding, empty states): simple inline SVG doodles using only the palette.
- Motion: a small wiggle/pop on success, wrapped in `prefers-reduced-motion: no-preference`.

**Primitives** (`shared/components/`): `SketchCard`, `SketchButton` (variants: primary yellow, secondary white, danger red), `SketchInput`, `SketchSelect`, `SketchBadge`, `SketchProgress`, `SketchModal`, `SketchTabs`, `DoodleIcon`, `Squiggle`. All feature UI is built from these primitives and theme tokens: no ad-hoc colors, borders, or shadows in feature code.

**Accessibility**: minimum touch target 44px; every interactive element has a `3px solid blue` focus ring with 2px offset; wobble and rotation must never hurt legibility; labels are always visible (no placeholder-only inputs).

**Tokens file**: `src/styles/theme.css` with Tailwind v4 `@theme` (colors, fonts, radii, shadows). Add a dev-only `/design` page (rendered only when `import.meta.env.DEV`) that shows every primitive, color, and state for visual review.

**Where it shows up**: the safe-to-spend card is the big yellow sticky note with the hand-underlined number; onboarding uses sketch radio cards for gender and a doodle illustration; PWA `theme_color` is yellow and `background_color` is paper; notification icons use the same doodle style.

---

## 5. Firestore data model

All data is user-scoped under `users/{uid}`.

```
users/{uid}                               // profile; existence + valid gender and birthday = onboarding complete
  { displayName: string (1-50), gender: 'female'|'male',
    birthDate: 'YYYY-MM-DD' (string, avoids timezone shifts), email: string,
    photoURL: string|null, createdAt: Timestamp, updatedAt: Timestamp }

users/{uid}/settings/budget
  { paydayDay: 1-31, balanceBase: int, balanceBaseDate: Timestamp }

users/{uid}/transactions/{id}
  { amount: int > 0, type: 'income'|'expense', categoryId: string|null,
    note: string, date: Timestamp, source: 'manual'|'quick-add',
    debtId: string|null, createdAt: Timestamp, updatedAt: Timestamp }

users/{uid}/categories/{id}
  { name, icon, type: 'expense'|'income', keywords: string[], isDefault: boolean }

users/{uid}/budgets/{categoryId}          // doc id = category id
  { limit: int }                          // period = current payday cycle

users/{uid}/fixedBills/{id}
  { name, amount: int, dueDay: 1-31, active: boolean, paidCycleKey: string|null }

users/{uid}/people/{id}
  { name, phone: string|null }

users/{uid}/debts/{id}
  { personId, direction: 'owed_to_me'|'i_owe', amount: int, paidAmount: int,
    dueDate: Timestamp|null, note, status: 'open'|'settled', createdAt: Timestamp }

users/{uid}/debts/{id}/payments/{id}
  { amount: int, paidAt: Timestamp, note }

notificationSubscriptions/{uid}           // top-level, doc id = uid, client-writable (see rules)
  { enabled: boolean, hideAmounts: boolean,
    timezone: string (IANA, default 'Asia/Jakarta'),
    slots: { morning: { enabled, hour: 7 }, noon: { enabled, hour: 12 }, evening: { enabled, hour: 18 } },
    fcmTokens: string[] (max 5), updatedAt: Timestamp }

notificationState/{uid}                   // top-level, server-only (no client access)
  { lastSent: { morning: 'YYYY-MM-DD'|null, noon: ..., evening: ... } }   // local dates, prevents duplicates
```

Notes:

- **Balance is derived, not stored.** `balance = balanceBase + sum(income) - sum(expense)` for transactions with `date >= balanceBaseDate`. This avoids drift when transactions are edited or deleted. The user sets `balanceBase` once in Settings (and can reset it).
- **Cycle**: a "cycle" runs from one payday to the next (see section 7). Budgets and safe-to-spend use the current cycle, not the calendar month.
- Seed default categories when onboarding completes (section 6.1): Makan, Jajan, Transport, Belanja, Tagihan, Hiburan, Kesehatan, Lainnya (expense); Gaji, Bonus, Lainnya (income). Each has sensible Indonesian `keywords` (e.g. Jajan: kopi, ngopi, boba, snack, gorengan; Transport: bensin, ojek, grab, gojek, parkir, tol).
- Cash movement for debts, see section 6.5.

---

## 6. Features and acceptance criteria

### 6.1 Auth, onboarding, and profile

- Login/register page, Google sign-in + email/password, logout.
- **Route guard** (`ProtectedRoute` + `AuthProvider`) has three states:
  1. not logged in -> redirect to `/login`;
  2. logged in but `users/{uid}` profile missing or gender/birthday invalid -> redirect to `/onboarding` (no other route is reachable);
  3. onboarded -> app. An onboarded user who opens `/onboarding` is redirected to `/`.
- **Onboarding (mandatory, cannot be skipped or dismissed)**, shown right after the first login or signup:
  - Display name: prefilled from the Google account when available, 1-50 characters.
  - Gender: **required**, two options, "Wanita" (`female`) and "Pria" (`male`), no option pre-selected.
  - Birthday: **required**, full date (selects for Tanggal, Bulan, Tahun, or a date picker). It is used to calculate the user's age for notification personalization (section 6.8) and for the birthday greeting. Stored as `birthDate: 'YYYY-MM-DD'`.
  - Validate with `isValidBirthDate(birthDate, today)` in `shared/utils/dates.js`: a real calendar date (Feb 29 only in leap years), not in the future, year >= 1900, and age >= `MIN_AGE` (constant in `shared/constants/`, default 13). Below `MIN_AGE`, show an Indonesian message and block signup. Unit-tested.
  - Add `calculateAge(birthDate, today)` (pure, unit-tested, handles a birthday not yet reached this year).
  - The submit button stays disabled until all fields are valid.
  - On submit, run one `writeBatch`: create the `users/{uid}` profile doc, create an empty `settings/budget`, and seed the default categories (section 5). If it fails, show an error with retry; never leave the user half-onboarded.
- **Profile page** (`/profile`, opened from the avatar in the header or bottom nav):
  - Shows avatar (Google photo, or initials as fallback), display name, email (read-only), and gender.
  - Edit display name, gender, and birthday; gender and birthday stay required and cannot be cleared.
  - Logout button.
- `useProfile()` hook exposes `{ profile, loading, error }`; profile reads and writes live in `features/auth/profile.service.js`.
- **Gender and age are used for the honorific and message tone only (greeting and notifications), nothing else.** The honorific depends on both: `female`/`male` plus age, Mbak/Mas under `SENIOR_HONORIFIC_AGE` (constant, default 45) and Ibu/Bapak from that age. Implement `getGreeting(profile, now)` in `features/auth/greeting.js` as a pure function: time-of-day phrase (`Selamat pagi` 04:00-10:59, `Selamat siang` 11:00-14:59, `Selamat sore` 15:00-17:59, `Selamat malam` otherwise) + honorific from `getHonorific(profile.gender, age)` (`female` -> `Mbak`/`Ibu`, `male` -> `Mas`/`Bapak`) + first word of `displayName`, e.g. `Selamat pagi, Mbak Sinta`. Unit-test every time bucket and both genders. Also export `getHonorific(gender, age)`, reused by notifications (section 6.8). Never inline this logic in components.
- **Categories are NOT assigned or hidden by gender.** Every user gets the same default categories. Add a neutral `SUGGESTED_CATEGORIES` list (e.g. Perawatan diri, Langganan, Hobi, Donasi, Hewan peliharaan, Pendidikan) shown in the categories settings as one-tap "Tambah" chips, identical for everyone.

### 6.2 Transactions

- Create, edit, delete, list (newest first, grouped by day), filter by month/cycle and category.
- Manual form: amount, type, category, note, date (default today).
- Money input accepts `25000` and displays `Rp 25.000`.

### 6.3 Categories and budgets

- CRUD categories (name, icon/emoji, keywords).
- Set a budget limit per expense category.
- Each budget shows `spent / limit`, remaining, and a progress bar: under 75% ok, 75-100% warning, over 100% over.
- `spent` = sum of expense transactions in that category within the current cycle (query by `categoryId` + date range).
- Warning banner if `sum(budget limits) > balance - remainingBills - debtsDue`.

### 6.4 Quick add (natural language)

Pure function in `features/quick-add/parseQuickAdd.js`:

```js
parseQuickAdd(text, { categories, people, today }) => {
  type,            // 'income' | 'expense'
  amount,          // integer rupiah | null
  note,            // cleaned text
  categoryId,      // matched by keyword | null
  date,            // Date, default today
  debt,            // { direction, personName, affectsCash } | null
  confidence       // 'high' | 'medium' | 'low'
}
```

**Amount rules**

- Suffix `rb`, `ribu`, `k` = x1.000; `jt`, `juta` = x1.000.000.
- Decimals with comma or dot when a suffix is present: `2,5jt` = 2.500.000, `1.5k` = 1.500.
- Without a suffix, dots/commas are thousand separators: `1.500.000` = 1500000, `50.000` = 50000.
- Optional `rp` prefix. If several numbers exist, prefer the one with a suffix/`rp`, else the largest.
- No number found: `amount: null` (UI asks the user).

**Type rules**: income keywords: `gaji`, `gajian`, `bonus`, `terima`, `dapat`, `masuk`, `dibayar`. Otherwise expense.

**Date rules**: `kemarin` = yesterday, `lusa`/`tadi` handled simply; default today.

**Debt rules**

- `minjemin <name> ...`, `pinjemin <name> ...`: `owed_to_me`, `affectsCash: true`.
- `pinjam ke <name> ...`: `i_owe`, `affectsCash: true`.
- `utang ke <name> ...`: `i_owe`, `affectsCash: false`.
- `<name> utang ...`: `owed_to_me`, `affectsCash: false`.
- `<name> bayar utang ...` / `bayar utang ke <name> ...`: repayment against an existing open debt with that person.

**Examples (must be unit tests)**

| Input                     | Result                                                 |
| ------------------------- | ------------------------------------------------------ |
| `beli kopi 25rb`          | expense, 25000, category Jajan (keyword "kopi")        |
| `gajian 5jt`              | income, 5000000, category Gaji                         |
| `bensin 50.000`           | expense, 50000, category Transport                     |
| `kemarin makan siang 35k` | expense, 35000, date = yesterday                       |
| `ngopi 2,5k`              | expense, 2500                                          |
| `minjemin budi 100rb`     | debt owed_to_me, person Budi, 100000, affectsCash true |
| `utang ke andi 75rb`      | debt i_owe, person Andi, 75000, affectsCash false      |
| `andi bayar utang 50rb`   | repayment of 50000 against Andi's open debt            |
| `halo`                    | amount null, confidence low                            |

**UX**: a quick-add input pinned at the bottom of the dashboard. After parsing, show an **editable preview card** (amount, type, category, date, debt info). Nothing is saved until the user confirms. After saving, show the updated "jatah hari ini" and the category's remaining budget (e.g. "Jajan sisa Rp 120.000").

If the user manually corrects the category for a note containing a word, offer to save that word as a keyword for the chosen category.

### 6.5 Debts and split bill

- People: create/select a person (name, optional phone).
- Debts: create, list (tabs: "Piutang" = owed to me, "Utang" = I owe), detail page with payment history, record a payment (partial allowed). `status` becomes `settled` when `paidAmount === amount`.
- **Debt and cash rules**: cash balance must stay accurate.
  - Lending cash (`owed_to_me`, `affectsCash`): create an expense transaction with `debtId` set and `categoryId: null`.
  - Borrowing cash (`i_owe`, `affectsCash`): create an income transaction with `debtId` set and `categoryId: null`.
  - Each payment on a debt creates a matching transaction (income for `owed_to_me`, expense for `i_owe`) with `debtId` set and `categoryId: null`, plus a `payments` document and an updated `paidAmount`, all in one `writeBatch`.
  - Transactions with `debtId` are excluded from category budgets and from "spent today".
- **Split bill**: input total, the user's own participation, pick people, choose equal split or custom amounts. Pure function `splitBill({ total, participants, mode })` distributes the remainder of rupiah fairly (no lost rupiah). On confirm, in one `writeBatch`:
  1. one expense transaction for the **user's own share** (categorized),
  2. for each other person: a debt `owed_to_me` plus an expense transaction (`debtId` set, `categoryId: null`, note "Talangin <name>") for their share.
- **WhatsApp share**: button on each debt that opens `https://wa.me/<phone>?text=<encoded message>` (or `https://wa.me/?text=...` when no phone). Normalize phone numbers in `shared/utils/phone.js` (`08xx` -> `628xx`). Message is Indonesian, polite, includes the remaining amount and due date.

### 6.6 Safe-to-spend

Pure function in `features/safe-to-spend/calculateSafeToSpend.js`:

```js
calculateSafeToSpend({
  balance,          // int, derived (see section 5)
  fixedBills,       // active bills not yet paid this cycle and due within it
  debts,            // open debts, direction 'i_owe'
  spentToday,       // int, variable expenses today (exclude fixed-bill payments and debtId transactions)
  paydayDay,
  today,
}) => {
  dailyAllowance,   // int >= 0, for today
  remainingToday,   // int (can be negative)
  daysLeft,         // int >= 1
  remainingBills,
  debtsDue,
  cycleEnd,         // Date (next payday)
}
```

Formulas:

```
remainingBills = sum of unpaid active fixed bills due between today and cycleEnd
debtsDue       = sum(amount - paidAmount) for open 'i_owe' debts with dueDate <= cycleEnd
daysLeft       = max(1, days from today (inclusive) until cycleEnd)
pool           = balance + spentToday - remainingBills - debtsDue
dailyAllowance = max(0, floor(pool / daysLeft))
remainingToday = dailyAllowance - spentToday
```

- **Receivables (`owed_to_me`) are never counted** until actually received. Keep the number conservative.
- Fixed bill "tandai lunas" sets `paidCycleKey` to the current cycle key and creates the expense transaction.
- Dashboard card shows: big number "Jatah hari ini sisa Rp X", sub-line with allowance, days left to payday, bills and debts reserved. Color changes when `remainingToday < 0`.

### 6.7 Dashboard

Header: greeting from `getGreeting` (section 6.1). Below it, in order: safe-to-spend card, budget progress list, upcoming bills/debts due, recent transactions. Quick-add input pinned at the bottom.

### 6.8 Personalized notifications (push)

Three scheduled reminders per day, in the user's own timezone:

| Slot      | Default time | Purpose                         |
| --------- | ------------ | ------------------------------- |
| `morning` | 07:00        | plan the day: today's allowance |
| `noon`    | 12:00        | midday check-in                 |
| `evening` | 18:00        | end-of-day recap                |

In `/settings/notifications` the user can turn notifications on/off, toggle each slot, change each slot's hour (whole hours), and enable `hideAmounts` (default off) so lock-screen texts omit rupiah amounts. The timezone is detected with `Intl.DateTimeFormat().resolvedOptions().timeZone` (default `Asia/Jakarta`) and re-saved when the app opens and the timezone changed.

**Client** (`features/notifications/`)

- `notification.service.js`: request permission, `getToken` with `VITE_FIREBASE_VAPID_KEY`, save the token (max 5 per user, dedupe) in `notificationSubscriptions/{uid}`, remove the token on disable/logout.
- `useNotifications()` hook and the settings UI.
- `public/firebase-messaging-sw.js` shows background notifications and opens `/` on click.
- Ask for browser permission **only after a user tap**: a soft prompt card on the dashboard ("Aktifkan pengingat harian?" with Aktifkan / Nanti). Never on page load. If permission is denied, show how to re-enable it and do not nag again.
- Make the app installable (PWA): `manifest.webmanifest` and icons. On iOS, web push only works after the app is added to the Home Screen, so show a short hint on iOS Safari.

**Server** (`functions/`, Node 20, `firebase-functions` v2)

- One scheduled function `sendScheduledNotifications` using `onSchedule` with cron `0 * * * *` (hourly).
- Each run: load subscriptions with `enabled == true`. For each user compute the local time from their timezone. For each enabled slot whose `hour` equals the local hour and whose `notificationState/{uid}.lastSent[slot]` is not today's local date: gather the user's data, build the message with `buildNotification`, send via FCM `sendEachForMulticast`, then write `lastSent[slot]`.
- Wrap each user in try/catch so one failure never stops the run. Remove tokens that fail with `messaging/registration-token-not-registered`.
- v1 loads all enabled subscriptions per run (fine at small scale). Leave a `TODO(scale)` comment: switch to precomputed UTC-hour indexed queries once users exceed a few thousand.
- Cloud Functions require the Firebase **Blaze** plan. Document this in `README.md`.

**Shared pure code**: `calculateSafeToSpend`, `getCycle`, `getHonorific`, `calculateAge`, and `buildNotification` must run in both the app and the function. Do not copy by hand. Add `scripts/sync-domain.mjs` that copies these pure files (no browser or Firebase imports allowed in them) into `functions/src/domain/`, run it as a `predeploy` hook in `firebase.json`, and add a test that fails when the copies differ.

**Message building**: `buildNotification({ slot, profile, summary, today, hideAmounts })` returns `{ title, body }` or `null`. It is pure and unit-tested. `summary` is `{ dailyAllowance, remainingToday, spentToday, daysLeft, budgetsNearLimit: [{ name, percent }], billsDueSoon: [{ name, amount, daysUntil }], debtsDueSoon: [{ personName, amount, direction, daysUntil }] }`. Address the user as honorific + first name (e.g. "Mbak Sinta"). Send at most one notification per slot: use the first rule below that applies.

Morning:

1. Birthday today (local date's month/day matches `birthDate`; Feb 29 birthdays are celebrated on Feb 28 in non-leap years): "Selamat ulang tahun yang ke-22, Mbak Sinta! Semoga tahun ini keuanganmu makin sehat." plus the day's allowance.
2. A bill or debt due today or tomorrow: "Selamat pagi, Mas Budi. Tagihan Listrik Rp 350.000 jatuh tempo besok. Jatah harianmu Rp 85.000."
3. Default: "Selamat pagi, Mas Budi. Jatah hari ini Rp 85.000, 12 hari lagi menuju gajian."

Noon:

1. A category budget at 90% or more: "Hati-hati, Mbak Sinta. Budget Jajan sudah 92%."
2. `spentToday == 0`: "Belum ada catatan hari ini. Sudah makan siang? Catat dulu biar jatahmu akurat."
3. Default: "Sampai siang ini terpakai Rp 40.000 dari jatah Rp 85.000. Sisa Rp 45.000."

Evening:

1. `remainingToday < 0`: "Hari ini lewat jatah Rp 20.000. Besok coba lebih hemat ya, Mas Budi."
2. A debt due within 3 days: "Piutang dari Andi Rp 75.000 jatuh tempo 2 hari lagi. Mau kirim pengingat?"
3. Default: "Rekap hari ini: terpakai Rp 60.000, sisa jatah Rp 25.000. Sudah catat semua, Mbak Sinta?"

Age personalization: `profile` is `{ displayName, gender, age }`, with `age` from `calculateAge(birthDate, today)`. The honorific comes from `getHonorific(gender, age)`. There are two tone groups: `young` (under 25) and `adult` (25 and up). The default message of each slot (rule 3) has one variant per group, e.g. morning: young "Pagi, Mbak Sinta! Jatah hari ini Rp 85.000, 12 hari lagi gajian. Semangat!" and adult "Selamat pagi, Mbak Sinta. Jatah hari ini Rp 85.000, 12 hari lagi menuju gajian." Derive the noon and evening variants the same way. Age is never shown in notification text except in the birthday message.

Tone: friendly and polite, never guilt-tripping, at most one emoji. With `hideAmounts` on, rewrite the texts without any rupiah amounts (e.g. "Jatah hari ini sudah siap, cek di aplikasi.").

---

## 7. Date and cycle logic (`shared/utils/dates.js`)

```
getCycle(today, paydayDay) => { start: Date, end: Date (exclusive, next payday), key: 'YYYY-MM-DD' of start }
```

- If `today`'s day-of-month >= payday (clamped to the month's length), the cycle starts this month; otherwise it started last month.
- Clamp `paydayDay` to the last day of short months (payday 31 in February = Feb 28/29).
- If today IS payday, a new cycle starts today.
- Unit tests: payday 25 (before/on/after), payday 31 in Feb, payday 1, year boundary (Dec -> Jan).

---

## 8. Firestore security rules (`firestore.rules`)

Deny everything by default. Only the owner can access their data. Validate money fields.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isOwner(uid) {
      return request.auth != null && request.auth.uid == uid;
    }

    function validTransaction(d) {
      return d.amount is int && d.amount > 0
        && d.type in ['income', 'expense']
        && d.date is timestamp;
    }

    function validDebt(d) {
      return d.amount is int && d.amount > 0
        && d.paidAmount is int && d.paidAmount >= 0 && d.paidAmount <= d.amount
        && d.direction in ['owed_to_me', 'i_owe'];
    }

    function validProfile(d) {
      return d.displayName is string
        && d.displayName.size() >= 1 && d.displayName.size() <= 50
        && d.gender in ['female', 'male']
        && d.birthDate is string
        && d.birthDate.matches('^(19|20)[0-9]{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$');
    }

    match /users/{uid} {
      allow read, delete: if isOwner(uid);
      allow create, update: if isOwner(uid) && validProfile(request.resource.data);

      match /transactions/{id} {
        allow read, delete: if isOwner(uid);
        allow create, update: if isOwner(uid) && validTransaction(request.resource.data);
      }

      match /debts/{id} {
        allow read, delete: if isOwner(uid);
        allow create, update: if isOwner(uid) && validDebt(request.resource.data);

        match /payments/{paymentId} {
          allow read, write: if isOwner(uid);
        }
      }

      match /categories/{id} { allow read, write: if isOwner(uid); }
      match /budgets/{id}    { allow read, write: if isOwner(uid); }
      match /fixedBills/{id} { allow read, write: if isOwner(uid); }
      match /people/{id}     { allow read, write: if isOwner(uid); }
      match /settings/{id}   { allow read, write: if isOwner(uid); }
    }

    match /notificationSubscriptions/{uid} {
      function validSubscription(d) {
        return d.enabled is bool && d.hideAmounts is bool
          && d.timezone is string
          && d.fcmTokens is list && d.fcmTokens.size() <= 5;
      }

      allow read, delete: if isOwner(uid);
      allow create, update: if isOwner(uid) && validSubscription(request.resource.data);
    }
  }
}
```

`notificationState/{uid}` intentionally has no rule (default deny): only the Cloud Function, using the Admin SDK, reads and writes it.

Do not add a wildcard `match /{document=**}` allow rule; it would bypass the validation above.

**Indexes** (`firestore.indexes.json`):

```json
{
  "indexes": [
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "categoryId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## 9. Routes

`/login`, `/onboarding` (mandatory after first login), `/` (dashboard), `/transactions`, `/budgets`, `/debts`, `/debts/:id`, `/profile`, `/settings` (payday, starting balance, fixed bills, categories), `/settings/notifications`.

---

## 10. Milestones

Complete one at a time. After each milestone run `npm run lint && npm test && npm run build`, fix failures, commit with a clear message, then summarize and stop.

- [ ] **M0 Scaffold**: Vite + React, Tailwind with the theme tokens, the hand-drawn `Sketch*` primitives and a dev-only `/design` preview page (section 4a), ESLint/Prettier, Vitest, folder structure, `lib/firebase.js`, `.env.example`, router with placeholder pages, app shell with bottom navigation (mobile).
- [ ] **M1 Auth, onboarding, profile**: AuthProvider, login/register, three-state route guard, mandatory onboarding (name + gender + birthday, batch write with category seeding), profile page with edit and logout, `profile.service.js`, `getGreeting`/`getHonorific` helpers, `calculateAge`, `isValidBirthDate`, tests for the guard logic, the profile validation (name, gender, birthday including `MIN_AGE`), `getGreeting`, `getHonorific`, `calculateAge`, and `isValidBirthDate`.
- [ ] **M2 Categories + transactions**: services, hooks, CRUD UI, month/cycle filter, `money.js` and `dates.js` with tests.
- [ ] **M3 Quick add**: `parseQuickAdd` (all table examples tested), preview card, save flow, keyword learning.
- [ ] **M4 Budgets**: budget CRUD, progress bars, over-budget warning banner.
- [ ] **M5 Safe-to-spend**: settings (payday, starting balance, fixed bills), `getCycle`, `calculateSafeToSpend` with edge-case tests, dashboard card, wired into quick-add feedback.
- [ ] **M6 Debts + split bill**: people, debts, payments, cash rules, `splitBill` with tests, WhatsApp share.
- [ ] **M7 Polish + deploy**: dashboard layout, empty/loading/error states, accessibility pass, responsive check, `firestore.rules`, `firestore.indexes.json`, Firebase Hosting config and deploy instructions in `README.md`.
- [ ] **M8 Notifications**: PWA manifest and icons; `public/firebase-messaging-sw.js`; `features/notifications/` (service, hook, settings UI at `/settings/notifications`, soft permission prompt on the dashboard); `functions/` project with `sendScheduledNotifications`; `scripts/sync-domain.mjs` with the `predeploy` hook and the copy-equality test; `buildNotification` with unit tests for every slot and priority branch, the birthday case (including Feb 29), and `hideAmounts`; security rules for `notificationSubscriptions`; `README.md` notes on the Blaze plan, VAPID key setup, the iOS Home Screen requirement, and how to test with the Functions emulator.

---

## 11. Out of scope for v1 (do NOT build)

AI fallback for quick-add (Cloud Functions), receipt OCR, multi-user/shared workspaces, report export (PDF/Excel), payments/subscriptions, offline mode, email/SMS reminders.

Prepare for a future freemium split by keeping a `plan: 'free' | 'pro'` field in `users/{uid}/settings/account` and reading it through a small `usePlan()` hook, but do not gate anything yet.

---

## 12. Definition of done (every milestone)

- `npm run lint`, `npm test`, and `npm run build` all pass.
- New pure functions have unit tests, including edge cases.
- No Firebase imports outside `*.service.js` and `lib/firebase.js`.
- No floats for money, no hardcoded secrets, no leftover debug code.
- Screens work at 360px width and have loading, empty, and error states.
- From M8 on: `functions/` passes lint and tests, and the synced domain copies are identical to the originals.
