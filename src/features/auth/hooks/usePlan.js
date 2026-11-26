import { useEffect, useState } from 'react';
import { subscribeToPlan } from '../plan.service.js';

export function usePlan(uid) {
  const [state, setState] = useState({ uid: null, plan: 'free', loading: false, error: '' });
  useEffect(() => {
    if (!uid) return undefined;
    return subscribeToPlan(
      uid,
      (plan) => setState({ uid, plan, loading: false, error: '' }),
      () =>
        setState({ uid, plan: 'free', loading: false, error: 'Paket akun belum dapat dimuat.' }),
    );
  }, [uid]);

  if (!uid) return { plan: 'free', loading: false, error: '' };
  if (state.uid !== uid) return { plan: 'free', loading: true, error: '' };
  return { plan: state.plan, loading: state.loading, error: state.error };
}
