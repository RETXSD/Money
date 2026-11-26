import assert from 'node:assert/strict';
import test from 'node:test';
import { buildNotification } from '../src/domain/buildNotification.js';
import { getZonedDateParts } from '../src/notificationSummary.js';

test("timezone extraction uses the user's local date and hour", () => {
  const parts = getZonedDateParts(new Date('2026-11-25T16:00:00.000Z'), 'Asia/Jakarta');
  assert.deepEqual(
    { year: parts.year, month: parts.month, day: parts.day, hour: parts.hour },
    { year: 2026, month: 11, day: 25, hour: 23 },
  );
});

test('the function runtime loads the generated shared notification domain', () => {
  const result = buildNotification({
    slot: 'morning',
    profile: { displayName: 'Raka Putra', gender: 'male', age: 28, birthDate: '1998-04-01' },
    summary: {
      dailyAllowance: 85_000,
      remainingToday: 85_000,
      spentToday: 0,
      daysLeft: 12,
      budgetsNearLimit: [],
      billsDueSoon: [],
      debtsDueSoon: [],
    },
    today: new Date(2026, 10, 25, 8),
  });
  assert.match(result.body, /Mas Raka/);
  assert.match(result.body, /Rp 85\.000/);
});
