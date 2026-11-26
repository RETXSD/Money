import { useEffect, useState } from 'react';
import { subscribeToFixedBills } from '../fixedBills.service.js';

function getBillsError(error) {
  return error?.code === 'permission-denied'
    ? 'Tagihan rutin belum bisa dibaca. Periksa pengaturan akses Firebase.'
    : 'Tagihan rutin belum dapat dimuat. Periksa koneksi lalu coba lagi.';
}

export function useFixedBills(uid) {
  const [state, setState] = useState({ uid: null, data: [], loading: false, error: '' });
  useEffect(() => {
    if (!uid) return undefined;
    return subscribeToFixedBills(
      uid,
      (data) => setState({ uid, data, loading: false, error: '' }),
      (error) => setState({ uid, data: [], loading: false, error: getBillsError(error) }),
    );
  }, [uid]);

  if (!uid) return { data: [], loading: false, error: '' };
  if (state.uid !== uid) return { data: [], loading: true, error: '' };
  return { data: state.data, loading: state.loading, error: state.error };
}
