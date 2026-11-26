import {
  QUICK_ADD_AMOUNT_MULTIPLIERS,
  QUICK_ADD_DATE_OFFSETS,
  QUICK_ADD_DEBT_DIRECTIVES,
  QUICK_ADD_INCOME_KEYWORDS,
} from '../../shared/constants/quickAdd.js';

const amountPattern = /(?:\b(rp)\s*)?(\d+(?:[.,]\d+)*)(?:\s*(rb|ribu|k|jt|juta)\b)?/gi;

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function parseIntegerAmount(numberText, suffix) {
  if (!suffix) {
    const digits = numberText.replace(/[.,]/g, '');
    const amount = Number(digits);
    return Number.isSafeInteger(amount) ? amount : null;
  }

  const normalizedNumber = numberText.replace(',', '.');
  const parts = normalizedNumber.split('.');
  if (parts.length > 2) return null;

  const whole = parts[0];
  const fraction = parts[1] || '';
  const denominator = 10n ** BigInt(fraction.length);
  const numerator =
    (BigInt(whole) * denominator + BigInt(fraction || '0')) *
    BigInt(QUICK_ADD_AMOUNT_MULTIPLIERS[suffix.toLowerCase()]);
  const rounded = (numerator + denominator / 2n) / denominator;
  return rounded <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(rounded) : null;
}

function getAmountCandidates(text) {
  return [...text.matchAll(amountPattern)].map((match) => {
    const amount = parseIntegerAmount(match[2], match[3]);
    return {
      amount,
      preferred: Boolean(match[1] || match[3]),
      index: match.index,
      length: match[0].length,
    };
  });
}

function selectAmount(candidates) {
  const validCandidates = candidates.filter((candidate) => candidate.amount !== null);
  const preferred = validCandidates.filter((candidate) => candidate.preferred);
  const pool = preferred.length ? preferred : validCandidates;
  return pool.sort((left, right) => right.amount - left.amount)[0] || null;
}

function getPersonName(text, people, pattern, fallbackPattern) {
  const normalized = normalizeText(text);
  for (const person of people) {
    const personName = normalizeText(person.name);
    if (!personName) continue;
    const expected = pattern(personName);
    if (normalized.includes(expected)) return person.name.trim();
  }

  const match = fallbackPattern.exec(normalized);
  return (
    match?.[1]?.trim().replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase('id-ID')) || ''
  );
}

function detectDebt(text, people) {
  const normalized = normalizeText(text);
  const repaymentByUserName = getPersonName(
    normalized,
    people,
    (name) => `bayar utang ke ${name}`,
    /\bbayar utang ke ([a-z]+(?: [a-z]+){0,2})\b/,
  );
  if (repaymentByUserName) {
    return {
      type: 'expense',
      debt: {
        direction: 'i_owe',
        personName: repaymentByUserName,
        affectsCash: true,
        repayment: true,
      },
    };
  }

  const repaymentByOtherName = getPersonName(
    normalized,
    people,
    (name) => `${name} bayar utang`,
    /^([a-z]+(?: [a-z]+){0,2}) bayar utang\b/,
  );
  if (repaymentByOtherName) {
    return {
      type: 'income',
      debt: {
        direction: 'owed_to_me',
        personName: repaymentByOtherName,
        affectsCash: true,
        repayment: true,
      },
    };
  }

  const lendingName = getPersonName(
    normalized,
    people,
    (name) => `minjemin ${name}`,
    /\b(?:minjemin|pinjemin) ([a-z]+(?: [a-z]+){0,2})\b/,
  );
  if (lendingName) {
    return {
      type: 'expense',
      debt: { direction: 'owed_to_me', personName: lendingName, affectsCash: true },
    };
  }

  const borrowingCashName = getPersonName(
    normalized,
    people,
    (name) => `pinjam ke ${name}`,
    /\bpinjam ke ([a-z]+(?: [a-z]+){0,2})\b/,
  );
  if (borrowingCashName) {
    return {
      type: 'income',
      debt: { direction: 'i_owe', personName: borrowingCashName, affectsCash: true },
    };
  }

  const borrowingNoCashName = getPersonName(
    normalized,
    people,
    (name) => `utang ke ${name}`,
    /\butang ke ([a-z]+(?: [a-z]+){0,2})\b/,
  );
  if (borrowingNoCashName) {
    return {
      type: 'expense',
      debt: { direction: 'i_owe', personName: borrowingNoCashName, affectsCash: false },
    };
  }

  const owedName = getPersonName(
    normalized,
    people,
    (name) => `${name} utang`,
    /^([a-z]+(?: [a-z]+){0,2}) utang\b/,
  );
  if (owedName) {
    return {
      type: 'expense',
      debt: { direction: 'owed_to_me', personName: owedName, affectsCash: false },
    };
  }

  return null;
}

function getDate(text, today) {
  const normalized = normalizeText(text);
  const dateKeyword = Object.keys(QUICK_ADD_DATE_OFFSETS).find((keyword) =>
    normalized.split(' ').includes(keyword),
  );
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (dateKeyword) date.setDate(date.getDate() + QUICK_ADD_DATE_OFFSETS[dateKeyword]);
  return date;
}

function getCategoryId(text, categories, type) {
  const normalized = ` ${normalizeText(text)} `;
  const matches = categories
    .filter((category) => category.type === type)
    .flatMap((category) =>
      (category.keywords || []).map((keyword) => ({
        categoryId: category.id,
        keyword: normalizeText(keyword),
      })),
    )
    .filter((candidate) => candidate.keyword && normalized.includes(` ${candidate.keyword} `))
    .sort((left, right) => right.keyword.length - left.keyword.length);

  return matches[0]?.categoryId || null;
}

function cleanNote(text, amountCandidates, debt) {
  let note = text;
  for (const candidate of [...amountCandidates].sort((left, right) => right.index - left.index)) {
    note = `${note.slice(0, candidate.index)} ${note.slice(candidate.index + candidate.length)}`;
  }
  for (const keyword of Object.keys(QUICK_ADD_DATE_OFFSETS)) {
    note = note.replace(new RegExp(`\\b${keyword}\\b`, 'gi'), ' ');
  }

  if (debt) {
    for (const directive of QUICK_ADD_DEBT_DIRECTIVES) {
      note = note.replace(new RegExp(`\\b${directive}\\b`, 'gi'), ' ');
    }
    const escapedName = debt.personName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    note = note.replace(new RegExp(`\\b${escapedName}\\b`, 'gi'), ' ');
  }

  return note
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parses an Indonesian quick-add phrase into a transaction preview.
 * @param {string} text User-entered text.
 * @param {{ categories?: Array, people?: Array, today: Date }} options Domain data and local date.
 * @returns {{ type: 'income'|'expense', amount: number|null, note: string, categoryId: string|null, date: Date, debt: object|null, confidence: 'high'|'medium'|'low' }} Parsed preview.
 */
export function parseQuickAdd(text, { categories = [], people = [], today }) {
  if (!(today instanceof Date) || Number.isNaN(today.getTime())) {
    throw new TypeError('today must be a valid Date');
  }

  const input = String(text || '').trim();
  const amountCandidates = getAmountCandidates(input);
  const selectedAmount = selectAmount(amountCandidates);
  const normalized = ` ${normalizeText(input)} `;
  const isIncome = QUICK_ADD_INCOME_KEYWORDS.some((keyword) => normalized.includes(` ${keyword} `));
  const debtMatch = detectDebt(input, people);
  const type = debtMatch?.type || (isIncome ? 'income' : 'expense');
  const categoryId = debtMatch ? null : getCategoryId(input, categories, type);
  const amount = selectedAmount?.amount ?? null;
  const confidence = debtMatch
    ? amount === null
      ? 'medium'
      : 'high'
    : amount === null
      ? 'low'
      : categoryId || isIncome
        ? 'high'
        : 'medium';

  return {
    type,
    amount,
    note: cleanNote(input, amountCandidates, debtMatch?.debt),
    categoryId,
    date: getDate(input, today),
    debt: debtMatch?.debt || null,
    confidence,
  };
}
