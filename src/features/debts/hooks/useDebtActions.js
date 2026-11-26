import { useState } from 'react';
import { createDebtWithPerson, recordDebtPayment } from '../debts.service.js';
import { createSplitBill } from '../splitBill.service.js';

export function useDebtActions(uid) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function run(action) {
    setSaving(true);
    setError('');
    try {
      const result = await action();
      return { success: true, result };
    } catch {
      setError('Perubahan belum tersimpan. Periksa koneksi lalu coba lagi.');
      return { success: false, result: null };
    } finally {
      setSaving(false);
    }
  }

  return {
    createDebt: (values) => run(() => createDebtWithPerson(uid, values)),
    recordPayment: (debt, values) => run(() => recordDebtPayment(uid, debt, values)),
    splitBill: (values) => run(() => createSplitBill(uid, values)),
    error,
    saving,
  };
}
