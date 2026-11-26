import { useEffect, useState } from 'react';
import { subscribeToCategories } from '../categories.service.js';

function getCategoriesError(error) {
  if (error?.code === 'permission-denied') {
    return 'Daftar kategori belum bisa dibaca. Periksa pengaturan akses Firebase.';
  }
  return 'Kategori belum dapat dimuat. Periksa koneksi lalu coba lagi.';
}

export function useCategories(uid) {
  const [state, setState] = useState({ uid: null, data: [], loading: false, error: '' });

  useEffect(() => {
    if (!uid) return undefined;
    return subscribeToCategories(
      uid,
      (data) => setState({ uid, data, loading: false, error: '' }),
      (error) => setState({ uid, data: [], loading: false, error: getCategoriesError(error) }),
    );
  }, [uid]);

  if (!uid) return { data: [], loading: false, error: '' };
  if (state.uid !== uid) return { data: [], loading: true, error: '' };
  return { data: state.data, loading: state.loading, error: state.error };
}
