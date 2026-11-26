import { formatRupiah } from '../../shared/utils/money.js';
import { normalizeIndonesianPhone } from '../../shared/utils/phone.js';

/** Builds a polite WhatsApp reminder with the outstanding amount and due date. */
export function buildDebtWhatsAppUrl({ personName, phone, remaining, dueDate, direction }) {
  const dueLabel = dueDate
    ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(
        dueDate,
      )
    : 'tanggal jatuh tempo belum ditentukan';
  const amount = formatRupiah(remaining);
  const body =
    direction === 'owed_to_me'
      ? `Halo ${personName}, aku ingin mengingatkan sisa piutang ${amount}. Jatuh tempo ${dueLabel}. Kabarin aku kalau sudah sempat ya. Terima kasih.`
      : `Halo ${personName}, aku mau mengabari sisa utangku ${amount}. Target jatuh tempo ${dueLabel}. Terima kasih sudah menunggu.`;
  const phoneDigits = normalizeIndonesianPhone(phone);
  const destination = phoneDigits ? `https://wa.me/${phoneDigits}` : 'https://wa.me/';
  return `${destination}?text=${encodeURIComponent(body)}`;
}
