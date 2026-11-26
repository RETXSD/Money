import { useEffect, useState } from 'react';
import { subscribeToProfile } from '../profile.service.js';

function getProfileError(error) {
  if (error?.code === 'permission-denied') {
    return 'Profil belum dapat dibaca. Periksa pengaturan akses Firebase.';
  }
  return 'Profil belum dapat dimuat. Periksa koneksi lalu coba lagi.';
}

export function useProfile(uid) {
  const [state, setState] = useState({ uid: null, profile: null, loading: false, error: '' });

  useEffect(() => {
    if (!uid) return undefined;
    return subscribeToProfile(
      uid,
      (profile) => setState({ uid, profile, loading: false, error: '' }),
      (error) => setState({ uid, profile: null, loading: false, error: getProfileError(error) }),
    );
  }, [uid]);

  if (!uid) return { profile: null, loading: false, error: '' };
  if (state.uid !== uid) return { profile: null, loading: true, error: '' };
  return { profile: state.profile, loading: state.loading, error: state.error };
}
