const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

/**
 * Formats an integer amount at the UI edge using Indonesian rupiah notation.
 * @param {number} amount Integer amount in rupiah.
 * @returns {string} Formatted rupiah amount.
 */
export function formatRupiah(amount) {
  if (!Number.isSafeInteger(amount)) return 'Rp 0';
  return rupiahFormatter.format(amount);
}

/**
 * Parses a manual rupiah input that may contain a currency prefix or separators.
 * @param {string} value Text entered by the user.
 * @returns {number|null} Integer rupiah amount, or null when empty/unsafe.
 */
export function parseRupiahInput(value) {
  const digits = String(value || '')
    .trim()
    .replace(/^rp\s*/i, '')
    .replace(/[.\s]/g, '');
  if (!/^\d+$/.test(digits)) return null;

  const amount = Number(digits);
  return Number.isSafeInteger(amount) ? amount : null;
}
