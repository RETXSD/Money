import { useEffect, useState } from 'react';
import { subscribeToBudgetSettings } from '../budgetSettings.service.js';

export function useBudgetSettings(uid) {
  const [state, setState] = useState({ uid: null, data: null, loading: false, error: '' });
  useEffect(() => {
    if (!uid) return undefined;
    return subscribeToBudgetSettings(
      uid,
      (data) => setState({ uid, data, loading: false, error: '' }),
      () =>
        setState({
          uid,
          data: null,
          loading: false,
          error: 'Pengaturan saldo belum dapat dimuat. Periksa koneksi lalu coba lagi.',
        }),
    );
  }, [uid]);

  if (!uid) return { data: null, loading: false, error: '' };
  if (state.uid !== uid) return { data: null, loading: true, error: '' };
  return { data: state.data, loading: state.loading, error: state.error };
}
