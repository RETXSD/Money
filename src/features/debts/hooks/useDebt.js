import { useEffect, useState } from 'react';
import { subscribeToDebt, subscribeToDebtPayments } from '../debts.service.js';

export function useDebt(uid, debtId) {
  const [debtState, setDebtState] = useState({ key: '', data: null, loading: false, error: '' });
  const [paymentState, setPaymentState] = useState({
    key: '',
    data: [],
    loading: false,
    error: '',
  });
  const key = `${uid}:${debtId}`;

  useEffect(() => {
    if (!uid || !debtId) return undefined;
    return subscribeToDebt(
      uid,
      debtId,
      (data) => setDebtState({ key, data, loading: false, error: '' }),
      () => setDebtState({ key, data: null, loading: false, error: 'Utang belum dapat dimuat.' }),
    );
  }, [uid, debtId, key]);

  useEffect(() => {
    if (!uid || !debtId) return undefined;
    return subscribeToDebtPayments(
      uid,
      debtId,
      (data) => setPaymentState({ key, data, loading: false, error: '' }),
      () =>
        setPaymentState({
          key,
          data: [],
          loading: false,
          error: 'Riwayat pembayaran belum dapat dimuat.',
        }),
    );
  }, [uid, debtId, key]);

  return {
    debt: debtState.key === key ? debtState.data : null,
    payments: paymentState.key === key ? paymentState.data : [],
    loading:
      !debtId ||
      debtState.key !== key ||
      paymentState.key !== key ||
      debtState.loading ||
      paymentState.loading,
    error:
      debtState.key === key ? debtState.error : paymentState.key === key ? paymentState.error : '',
  };
}
