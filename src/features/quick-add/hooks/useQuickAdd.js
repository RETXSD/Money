import { useState } from 'react';
import { parseQuickAdd } from '../parseQuickAdd.js';
import { saveQuickAddTransaction } from '../quickAdd.service.js';

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

  async function save({ learnKeyword = '', categoryKeywords = [] } = {}) {
    if (!preview || !uid) return false;
    if (!Number.isSafeInteger(preview.amount) || preview.amount <= 0) {
      setError('Masukkan jumlah rupiah bulat yang lebih dari nol.');
      return false;
    }
    if (!(preview.date instanceof Date) || Number.isNaN(preview.date.getTime())) {
      setError('Pilih tanggal transaksi yang valid.');
      return false;
    }
    if (preview.debt) {
      setError('Catatan utang dan pembayaran akan bisa disimpan pada fitur Utang & Piutang.');
      return false;
    }

    setSaving(true);
    setError('');
    try {
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
