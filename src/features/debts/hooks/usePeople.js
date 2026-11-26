import { useEffect, useState } from 'react';
import { subscribeToPeople } from '../people.service.js';

export function usePeople(uid) {
  const [state, setState] = useState({ uid: null, data: [], loading: false, error: '' });
  useEffect(() => {
    if (!uid) return undefined;
    return subscribeToPeople(
      uid,
      (data) => setState({ uid, data, loading: false, error: '' }),
      () => setState({ uid, data: [], loading: false, error: 'Daftar teman belum dapat dimuat.' }),
    );
  }, [uid]);

  if (!uid) return { data: [], loading: false, error: '' };
  if (state.uid !== uid) return { data: [], loading: true, error: '' };
  return { data: state.data, loading: state.loading, error: state.error };
}
