import { Timestamp } from 'firebase-admin/firestore';
import { calculateAge, formatLocalDate, getCycle } from './domain/dates.js';
import {
  DEFAULT_PAYDAY_DAY,
  EVENING_DEBT_DUE_DAYS,
  MILLISECONDS_PER_DAY,
} from './domain/constants.js';
import {
  calculateSafeToSpend,
  getUpcomingFixedBills,
  sumVariableExpensesToday,
} from './domain/safeToSpend.js';

const localDateFormatterOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
};

export function getZonedDateParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    ...localDateFormatterOptions,
    timeZone,
  }).formatToParts(date);
  return Object.fromEntries(
    parts.filter((part) => part.type !== 'literal').map((part) => [part.type, Number(part.value)]),
  );
}

function dateKeyFromParts(parts) {
  return `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

function dateKeyDayNumber(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / MILLISECONDS_PER_DAY);
}

function calendarDateFromKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function localCalendarDate(date, timeZone) {
  return calendarDateFromKey(dateKeyFromParts(getZonedDateParts(date, timeZone)));
}

function localMidnight(dateKey, timeZone) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const target = Date.UTC(year, month - 1, day);
  let instant = target;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const local = getZonedDateParts(new Date(instant), timeZone);
    const represented = Date.UTC(
      local.year,
      local.month - 1,
      local.day,
      local.hour,
      local.minute,
      local.second,
    );
    instant += target - represented;
  }

  return new Date(instant);
}

function mapSnapshot(snapshot) {
  return { id: snapshot.id, ...snapshot.data() };
}

function safeAdd(total, amount) {
  const result = total + amount;
  if (!Number.isSafeInteger(result))
    throw new RangeError('Balance exceeds the safe integer range.');
  return result;
}

/** Loads the user's local-day data and builds the summary needed by reminders. */
export async function loadNotificationContext(db, uid, timeZone, now) {
  const userRef = db.collection('users').doc(uid);
  const settingsRef = userRef.collection('settings').doc('budget');
  const [profileSnapshot, settingsSnapshot] = await Promise.all([userRef.get(), settingsRef.get()]);
  if (!profileSnapshot.exists()) return null;

  const profileData = profileSnapshot.data();
  const settings = settingsSnapshot.exists() ? settingsSnapshot.data() : {};
  const zonedNow = getZonedDateParts(now, timeZone);
  const todayKey = dateKeyFromParts(zonedNow);
  const today = calendarDateFromKey(todayKey);
  const paydayDay = Number.isInteger(settings.paydayDay) ? settings.paydayDay : DEFAULT_PAYDAY_DAY;
  const cycle = getCycle(today, paydayDay);
  const cycleStartKey = formatLocalDate(cycle.start);
  const cycleEndKey = formatLocalDate(cycle.end);
  const transactionsRef = userRef.collection('transactions');
  const cycleTransactionsQuery = transactionsRef
    .where('date', '>=', Timestamp.fromDate(localMidnight(cycleStartKey, timeZone)))
    .where('date', '<', Timestamp.fromDate(localMidnight(cycleEndKey, timeZone)));
  const balanceBaseDate = settings.balanceBaseDate?.toDate?.() || new Date(0);
  const balanceTransactionsQuery = transactionsRef.where(
    'date',
    '>=',
    Timestamp.fromDate(balanceBaseDate),
  );
  const [
    cycleTransactionsSnapshot,
    balanceTransactionsSnapshot,
    billsSnapshot,
    debtsSnapshot,
    categoriesSnapshot,
    budgetsSnapshot,
    peopleSnapshot,
  ] = await Promise.all([
    cycleTransactionsQuery.get(),
    balanceTransactionsQuery.get(),
    userRef.collection('fixedBills').get(),
    userRef.collection('debts').get(),
    userRef.collection('categories').get(),
    userRef.collection('budgets').get(),
    userRef.collection('people').get(),
  ]);

  const cycleTransactions = cycleTransactionsSnapshot.docs.map((snapshot) => {
    const transaction = mapSnapshot(snapshot);
    return { ...transaction, date: transaction.date?.toDate?.() || null };
  });
  const localDayTransactions = cycleTransactions.map((transaction) => ({
    ...transaction,
    date: transaction.date ? localCalendarDate(transaction.date, timeZone) : null,
  }));
  const balance = balanceTransactionsSnapshot.docs.reduce(
    (total, snapshot) => {
      const transaction = snapshot.data();
      if (!Number.isSafeInteger(transaction.amount)) return total;
      return safeAdd(
        total,
        transaction.type === 'income' ? transaction.amount : -transaction.amount,
      );
    },
    Number.isSafeInteger(settings.balanceBase) ? settings.balanceBase : 0,
  );
  const fixedBills = billsSnapshot.docs.map(mapSnapshot);
  const debts = debtsSnapshot.docs.map((snapshot) => {
    const debt = mapSnapshot(snapshot);
    return {
      ...debt,
      dueDate: debt.dueDate?.toDate?.() ? localCalendarDate(debt.dueDate.toDate(), timeZone) : null,
    };
  });
  const upcomingBills = getUpcomingFixedBills({ fixedBills, today, cycle });
  const spentToday = sumVariableExpensesToday(localDayTransactions, today);
  const safe = calculateSafeToSpend({
    balance,
    fixedBills: upcomingBills,
    debts,
    spentToday,
    paydayDay,
    today,
  });
  const categoryNames = new Map(
    categoriesSnapshot.docs.map((snapshot) => {
      const category = snapshot.data();
      return [snapshot.id, category.name || 'Lainnya'];
    }),
  );
  const spentByCategory = new Map();
  for (const transaction of cycleTransactions) {
    if (
      transaction.type !== 'expense' ||
      transaction.debtId ||
      !transaction.categoryId ||
      !Number.isSafeInteger(transaction.amount)
    )
      continue;
    spentByCategory.set(
      transaction.categoryId,
      safeAdd(spentByCategory.get(transaction.categoryId) || 0, transaction.amount),
    );
  }
  const budgetsNearLimit = budgetsSnapshot.docs
    .map((snapshot) => {
      const budget = snapshot.data();
      if (!Number.isSafeInteger(budget.limit) || budget.limit <= 0) return null;
      const spent = spentByCategory.get(snapshot.id) || 0;
      return {
        name: categoryNames.get(snapshot.id) || 'Lainnya',
        percent: Math.floor((spent / budget.limit) * 100),
      };
    })
    .filter((budget) => budget && budget.percent >= 90)
    .sort((left, right) => right.percent - left.percent);
  const todayDayNumber = dateKeyDayNumber(todayKey);
  const billsDueSoon = upcomingBills
    .map((bill) => ({
      name: bill.name,
      amount: bill.amount,
      daysUntil: dateKeyDayNumber(formatLocalDate(bill.dueDate)) - todayDayNumber,
    }))
    .filter((bill) => bill.daysUntil >= 0 && bill.daysUntil <= EVENING_DEBT_DUE_DAYS);
  const personNames = new Map(
    peopleSnapshot.docs.map((snapshot) => [snapshot.id, snapshot.data().name]),
  );
  const debtsDueSoon = debts
    .filter((debt) => debt.status === 'open' && debt.dueDate instanceof Date)
    .map((debt) => ({
      personName: personNames.get(debt.personId) || 'Teman',
      amount: Math.max(0, debt.amount - debt.paidAmount),
      direction: debt.direction,
      daysUntil: dateKeyDayNumber(formatLocalDate(debt.dueDate)) - todayDayNumber,
    }))
    .filter((debt) => debt.daysUntil >= 0 && debt.daysUntil <= EVENING_DEBT_DUE_DAYS);

  const profile = {
    displayName: profileData.displayName,
    gender: profileData.gender,
    birthDate: profileData.birthDate,
    age: calculateAge(profileData.birthDate, today),
  };
  return {
    profile,
    summary: {
      dailyAllowance: safe.dailyAllowance,
      remainingToday: safe.remainingToday,
      spentToday,
      daysLeft: safe.daysLeft,
      budgetsNearLimit,
      billsDueSoon,
      debtsDueSoon,
    },
  };
}
