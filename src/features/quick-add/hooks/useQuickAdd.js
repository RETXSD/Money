import { useState } from 'react';
import { parseQuickAdd } from '../parseQuickAdd.js';
import { saveQuickAddTransaction } from '../quickAdd.service.js';
import { createDebtWithPerson, recordDebtPayment } from '../../debts/index.js';

export function useQuickAdd(uid) {
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function parse(text, options) {
    setError('');
    setSuccess('');
    if (!String(text || '').trim()) {
      setError('Tulis dulu transaksi yang ingin dicatat.');
      return;
    }
    const parsed = parseQuickAdd(text, options);
    setPreview({ ...parsed, originalText: text, parsedCategoryId: parsed.categoryId });
  }

  function updatePreview(field, value) {
    setPreview((current) => (current ? { ...current, [field]: value } : current));
  }

  async function save({
    learnKeyword = '',
    categoryKeywords = [],
    people = [],
    debts = [],
    peopleLoading = false,
    debtsLoading = false,
  } = {}) {
    if (!preview || !uid) return false;
    if (!Number.isSafeInteger(preview.amount) || preview.amount <= 0) {
      setError('Masukkan jumlah rupiah bulat yang lebih dari nol.');
      return false;
    }
    if (!(preview.date instanceof Date) || Number.isNaN(preview.date.getTime())) {
      setError('Pilih tanggal transaksi yang valid.');
      return false;
    }
    setSaving(true);
    setError('');
    try {
      if (preview.debt) {
        if (preview.debt.repayment && debtsLoading) {
          setError('Daftar utang sedang dimuat. Coba simpan lagi sebentar.');
          return false;
        }
        if (!preview.debt.repayment && peopleLoading) {
          setError('Daftar teman sedang dimuat. Coba simpan lagi sebentar.');
          return false;
        }
        const person = people.find(
          (item) =>
            item.name.trim().toLocaleLowerCase('id-ID') ===
            preview.debt.personName.trim().toLocaleLowerCase('id-ID'),
        );
        if (preview.debt.repayment) {
          const existingDebt = debts.find(
            (debt) =>
              debt.direction === preview.debt.direction &&
              debt.status === 'open' &&
              debt.personId === person?.id,
          );
          if (!existingDebt) {
            setError(`Tidak ada utang terbuka untuk ${preview.debt.personName}.`);
            return false;
          }
          await recordDebtPayment(uid, existingDebt, {
            amount: preview.amount,
            paidAt: preview.date,
            note: preview.note,
            source: 'quick-add',
          });
          setSuccess('Pembayaran utang berhasil dicatat.');
        } else {
          await createDebtWithPerson(uid, {
            personId: person?.id,
            personName: preview.debt.personName,
            direction: preview.debt.direction,
            amount: preview.amount,
            paidAmount: 0,
            dueDate: null,
            note: preview.note,
            affectsCash: preview.debt.affectsCash,
            cashDate: preview.date,
            cashNote: preview.note,
            source: 'quick-add',
          });
          setSuccess('Catatan utang berhasil disimpan.');
        }
        setPreview(null);
        return true;
      }
      const category = learnKeyword
        ? {
            categoryId: preview.categoryId,
            keyword: learnKeyword,
            keywords: [...new Set([...categoryKeywords, learnKeyword])],
          }
        : null;
      await saveQuickAddTransaction(
        uid,
        {
          amount: preview.amount,
          type: preview.type,
          categoryId: preview.categoryId,
          note: preview.note,
          date: preview.date,
        },
        category,
      );
      setSuccess('Transaksi berhasil disimpan.');
      setPreview(null);
      return true;
    } catch {
      setError('Transaksi belum tersimpan. Periksa koneksi lalu coba lagi.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  function clear() {
    setPreview(null);
    setError('');
  }

  return { clear, error, parse, preview, saving, success, updatePreview, save };
}
