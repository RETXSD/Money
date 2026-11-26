import { useEffect, useState } from 'react';
import { subscribeToDebts } from '../debts.service.js';

export function useDebts(uid) {
  const [state, setState] = useState({ uid: null, data: [], loading: false, error: '' });
  useEffect(() => {
    if (!uid) return undefined;
    return subscribeToDebts(
      uid,
      (data) => setState({ uid, data, loading: false, error: '' }),
      () => setState({ uid, data: [], loading: false, error: 'Daftar utang belum dapat dimuat.' }),
    );
  }, [uid]);

  if (!uid) return { data: [], loading: false, error: '' };
  if (state.uid !== uid) return { data: [], loading: true, error: '' };
  return { data: state.data, loading: state.loading, error: state.error };
}
