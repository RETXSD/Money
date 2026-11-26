import { useEffect, useState } from 'react';
import { subscribeToBudgets } from '../budgets.service.js';

function getBudgetsError(error) {
  return error?.code === 'permission-denied'
    ? 'Anggaran belum bisa dibaca. Periksa pengaturan akses Firebase.'
    : 'Anggaran belum dapat dimuat. Periksa koneksi lalu coba lagi.';
}

export function useBudgets(uid) {
  const [state, setState] = useState({ uid: null, data: [], loading: false, error: '' });

  useEffect(() => {
    if (!uid) return undefined;
    return subscribeToBudgets(
      uid,
      (data) => setState({ uid, data, loading: false, error: '' }),
      (error) => setState({ uid, data: [], loading: false, error: getBudgetsError(error) }),
    );
  }, [uid]);

  if (!uid) return { data: [], loading: false, error: '' };
  if (state.uid !== uid) return { data: [], loading: true, error: '' };
  return { data: state.data, loading: state.loading, error: state.error };
}
