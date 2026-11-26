import { useEffect, useState } from 'react';
import { subscribeToTransactions } from '../transactions.service.js';

function getTransactionsError(error) {
  if (error?.code === 'permission-denied') {
    return 'Transaksi belum bisa dibaca. Periksa pengaturan akses Firebase.';
  }
  return 'Transaksi belum dapat dimuat. Periksa koneksi lalu coba lagi.';
}

export function useTransactions(uid, { startDate, endDate, categoryId }) {
  const startTime = startDate?.getTime() ?? null;
  const endTime = endDate?.getTime() ?? null;
  const queryKey = `${uid}:${startTime}:${endTime}:${categoryId || ''}`;
  const [state, setState] = useState({ key: '', data: [], loading: false, error: '' });

  useEffect(() => {
    if (!uid || startTime === null || endTime === null) return undefined;
    const filter = {
      startDate: new Date(startTime),
      endDate: new Date(endTime),
      categoryId,
    };
    return subscribeToTransactions(
      uid,
      filter,
      (data) => setState({ key: queryKey, data, loading: false, error: '' }),
      (error) =>
        setState({ key: queryKey, data: [], loading: false, error: getTransactionsError(error) }),
    );
  }, [uid, startTime, endTime, categoryId, queryKey]);

  if (!uid) return { data: [], loading: false, error: '' };
  if (state.key !== queryKey || startTime === null || endTime === null) {
    return { data: [], loading: true, error: '' };
  }
  return { data: state.data, loading: state.loading, error: state.error };
}
