import { useState } from 'react';
import { useAuth } from '../../app/providers/useAuth.js';
import { SketchBadge } from '../../shared/components/SketchFeedback.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { getAuthErrorMessage, signOutUser } from './auth.service.js';
import { useProfile } from './hooks/useProfile.js';
import { ProfileEditor } from './ProfileEditor.jsx';

export function ProfilePage() {
  const { user } = useAuth();
  const { profile, loading, error: loadError } = useProfile(user?.uid);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  if (loading) return <p role="status">Memuat profil…</p>;
  if (loadError) return <SketchCard role="alert">{loadError}</SketchCard>;
  if (!profile) return <SketchCard role="status">Profil belum tersedia.</SketchCard>;

  async function logout() {
    try {
      await signOutUser();
    } catch (logoutError) {
      setError(getAuthErrorMessage(logoutError));
    }
  }

  return (
    <div className="page-grid">
      <header>
        <SketchBadge variant="info">Akunmu</SketchBadge>
        <h1 className="page-heading mt-3">Profil</h1>
      </header>
      <SketchCard>
        <div className="mb-5 flex items-center gap-4">
          {profile.photoURL ? (
            <img alt="" className="profile-avatar" src={profile.photoURL} />
          ) : (
            <div aria-hidden="true" className="profile-avatar profile-avatar-initial">
              {profile.displayName?.trim().charAt(0).toUpperCase() || '?'}
            </div>
          )}
          <div>
            <h2 className="font-heading m-0 text-3xl">{profile.displayName}</h2>
            <p className="m-0">{profile.email || user?.email || 'Email tidak tersedia'}</p>
          </div>
        </div>

        {editing ? (
          <ProfileEditor
            onCancel={() => setEditing(false)}
            onSaved={() => setEditing(false)}
            profile={profile}
            uid={user.uid}
          />
        ) : (
          <div className="grid gap-3">
            <p className="m-0">
              <strong>Gender:</strong> {profile.gender === 'female' ? 'Wanita' : 'Pria'}
            </p>
            <p className="m-0">
              <strong>Tanggal lahir:</strong> {profile.birthDate}
            </p>
            {error ? (
              <p className="text-red-dark m-0" role="alert">
                {error}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-3">
              <SketchButton onClick={() => setEditing(true)} variant="secondary">
                Ubah profil
              </SketchButton>
              <SketchButton onClick={logout} variant="danger">
                Keluar
              </SketchButton>
            </div>
          </div>
        )}
      </SketchCard>
    </div>
  );
}
