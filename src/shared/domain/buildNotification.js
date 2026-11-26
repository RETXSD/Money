import {
  EVENING_DEBT_DUE_DAYS,
  MORNING_DUE_DAYS,
  NOTIFICATION_BUDGET_WARNING_PERCENT,
  NOTIFICATION_SLOTS,
} from './constants.js';
import { calculateAge } from './dates.js';
import { getHonorific } from './honorific.js';

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  maximumFractionDigits: 0,
});

function formatRupiah(amount) {
  const safeAmount = Number.isSafeInteger(amount) ? amount : 0;
  return `Rp ${rupiahFormatter.format(safeAmount)}`;
}

function getAddress(profile) {
  const firstName = profile.displayName?.trim().split(/\s+/)[0];
  const honorific = getHonorific(profile.gender, profile.age ?? 0);
  return firstName && honorific ? `${honorific} ${firstName}` : 'teman';
}

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function isBirthdayToday(birthDate, today) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate || '');
  if (!match) return false;
  const [, , monthText, dayText] = match;
  const birthMonth = Number(monthText);
  const birthDay = Number(dayText);
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();
  if (birthMonth === todayMonth && birthDay === todayDay) return true;
  return (
    birthMonth === 2 &&
    birthDay === 29 &&
    !isLeapYear(today.getFullYear()) &&
    todayMonth === 2 &&
    todayDay === 28
  );
}

function getBirthdayAge(profile, today) {
  const age = profile.age ?? calculateAge(profile.birthDate, today);
  if (age === null || age === undefined) return null;
  const isObservedLeapBirthday =
    profile.birthDate?.endsWith('-02-29') &&
    today.getMonth() === 1 &&
    today.getDate() === 28 &&
    !isLeapYear(today.getFullYear());
  return isObservedLeapBirthday ? age + 1 : age;
}

function getDuePhrase(daysUntil) {
  if (daysUntil <= 0) return 'hari ini';
  if (daysUntil === 1) return 'besok';
  return `dalam ${daysUntil} hari`;
}

function getMorningDueItem(summary) {
  const candidates = [
    ...(summary.billsDueSoon || []).map((bill) => ({ ...bill, kind: 'bill' })),
    ...(summary.debtsDueSoon || []).map((debt) => ({ ...debt, kind: 'debt' })),
  ]
    .filter(
      (item) =>
        Number.isInteger(item.daysUntil) &&
        item.daysUntil >= 0 &&
        item.daysUntil <= MORNING_DUE_DAYS,
    )
    .sort((left, right) => left.daysUntil - right.daysUntil);
  return candidates[0] || null;
}

function buildMorning({ profile, summary, today, hideAmounts, address, isYoung }) {
  if (isBirthdayToday(profile.birthDate, today)) {
    const age = getBirthdayAge(profile, today);
    const birthday =
      age === null
        ? `Selamat ulang tahun, ${address}! Semoga tahun ini keuanganmu makin sehat.`
        : `Selamat ulang tahun yang ke-${age}, ${address}! Semoga tahun ini keuanganmu makin sehat.`;
    return {
      title: 'Selamat ulang tahun!',
      body: hideAmounts
        ? `${birthday} Jatah hari ini sudah siap, cek di aplikasi.`
        : `${birthday} Jatah hari ini ${formatRupiah(summary.dailyAllowance)}.`,
    };
  }

  const dueItem = getMorningDueItem(summary);
  if (dueItem) {
    const dueDescription =
      dueItem.kind === 'bill'
        ? `Tagihan ${dueItem.name}`
        : dueItem.direction === 'owed_to_me'
          ? `Piutang dari ${dueItem.personName}`
          : `Utang ke ${dueItem.personName}`;
    return {
      title: 'Pengingat pagi',
      body: hideAmounts
        ? `Selamat pagi, ${address}. ${dueDescription} segera jatuh tempo. Jatah harianmu sudah siap di aplikasi.`
        : `Selamat pagi, ${address}. ${dueDescription} ${formatRupiah(dueItem.amount)} jatuh tempo ${getDuePhrase(dueItem.daysUntil)}. Jatah harianmu ${formatRupiah(summary.dailyAllowance)}.`,
    };
  }

  return {
    title: 'Rencana uang hari ini',
    body: hideAmounts
      ? isYoung
        ? `Pagi, ${address}! Jatah hari ini sudah siap. Semangat!`
        : `Selamat pagi, ${address}. Cek jatah hari ini dan waktu menuju gajian di aplikasi.`
      : isYoung
        ? `Pagi, ${address}! Jatah hari ini ${formatRupiah(summary.dailyAllowance)}, ${summary.daysLeft} hari lagi gajian. Semangat!`
        : `Selamat pagi, ${address}. Jatah hari ini ${formatRupiah(summary.dailyAllowance)}, ${summary.daysLeft} hari lagi menuju gajian.`,
  };
}

function buildNoon({ profile, summary, hideAmounts, address }) {
  const nearBudget = (summary.budgetsNearLimit || [])
    .filter((budget) => budget.percent >= NOTIFICATION_BUDGET_WARNING_PERCENT)
    .sort((left, right) => right.percent - left.percent)[0];
  if (nearBudget) {
    return {
      title: 'Cek anggaran',
      body: hideAmounts
        ? `Budget ${nearBudget.name} sudah mendekati batas. Cek aplikasi untuk detailnya.`
        : `Hati-hati, ${address}. Budget ${nearBudget.name} sudah ${Math.round(nearBudget.percent)}%.`,
    };
  }

  if (summary.spentToday === 0) {
    return {
      title: 'Catatan siang',
      body: hideAmounts
        ? 'Belum ada catatan hari ini. Sudah makan siang? Catat dulu biar jatahmu akurat.'
        : 'Belum ada catatan hari ini. Sudah makan siang? Catat dulu biar jatahmu akurat.',
    };
  }

  return {
    title: 'Cek jatah siang',
    body: hideAmounts
      ? `Pengeluaranmu sudah tercatat. Cek sisa jatah hari ini di aplikasi, ${address}.`
      : profile.age < 25
        ? `Sampai siang ini sudah tercatat ${formatRupiah(summary.spentToday)}. Jatah hari ini ${formatRupiah(summary.dailyAllowance)}, sisanya ${formatRupiah(summary.remainingToday)}. Pelan-pelan aja, ${address}!`
        : `Sampai siang ini terpakai ${formatRupiah(summary.spentToday)} dari jatah ${formatRupiah(summary.dailyAllowance)}. Sisa ${formatRupiah(summary.remainingToday)}.`,
  };
}

function buildEvening({ profile, summary, hideAmounts, address }) {
  if (summary.remainingToday < 0) {
    const overage = Math.abs(summary.remainingToday);
    return {
      title: 'Rekap malam',
      body: hideAmounts
        ? `Hari ini jatah terlampaui. Besok jatah harian dihitung lagi ya, ${address}.`
        : `Hari ini lewat jatah ${formatRupiah(overage)}. Besok jatah harian dihitung lagi ya, ${address}.`,
    };
  }

  const dueDebt = (summary.debtsDueSoon || [])
    .filter(
      (debt) =>
        Number.isInteger(debt.daysUntil) &&
        debt.daysUntil >= 0 &&
        debt.daysUntil <= EVENING_DEBT_DUE_DAYS,
    )
    .sort((left, right) => left.daysUntil - right.daysUntil)[0];
  if (dueDebt) {
    const description =
      dueDebt.direction === 'owed_to_me'
        ? `Piutang dari ${dueDebt.personName}`
        : `Utang ke ${dueDebt.personName}`;
    return {
      title: 'Pengingat pembayaran',
      body: hideAmounts
        ? `${description} jatuh tempo ${getDuePhrase(dueDebt.daysUntil)}. Cek detailnya di aplikasi.`
        : `${description} ${formatRupiah(dueDebt.amount)} jatuh tempo ${getDuePhrase(dueDebt.daysUntil)}. Mau cek detailnya?`,
    };
  }

  return {
    title: 'Rekap harian',
    body: hideAmounts
      ? `Pengeluaran hari ini sudah tercatat. Cek sisa jatahmu di aplikasi, ${address}.`
      : profile.age < 25
        ? `Rekap hari ini: terpakai ${formatRupiah(summary.spentToday)}, sisa jatah ${formatRupiah(summary.remainingToday)}. Besok lanjut catat, ${address}!`
        : `Rekap hari ini: terpakai ${formatRupiah(summary.spentToday)}, sisa jatah ${formatRupiah(summary.remainingToday)}. Sudah catat semua, ${address}?`,
  };
}

/**
 * Builds one localized, privacy-aware reminder for a scheduled slot.
 * @param {{ slot: string, profile: object, summary: object, today: Date, hideAmounts?: boolean }} input
 * @returns {{ title: string, body: string }|null}
 */
export function buildNotification({ slot, profile, summary, today, hideAmounts = false }) {
  if (
    !NOTIFICATION_SLOTS.includes(slot) ||
    !profile ||
    !summary ||
    !(today instanceof Date) ||
    Number.isNaN(today.getTime())
  )
    return null;

  const normalizedProfile = { ...profile, age: profile.age ?? 0 };
  const context = {
    profile: normalizedProfile,
    summary,
    today,
    hideAmounts,
    address: getAddress(normalizedProfile),
    isYoung: normalizedProfile.age < 25,
  };
  if (slot === 'morning') return buildMorning(context);
  if (slot === 'noon') return buildNoon(context);
  return buildEvening(context);
}
