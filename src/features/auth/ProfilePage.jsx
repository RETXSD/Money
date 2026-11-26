import { useState } from 'react';
import { useAuth } from '../../app/providers/useAuth.js';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { PageContainer, PageHeader, Row, Stack } from '../../shared/components/Layout.jsx';
import { APP_COPY } from '../../shared/constants/copy.js';
import { getAuthErrorMessage, signOutUser } from './auth.service.js';
import { useProfile } from './hooks/useProfile.js';
import { ProfileEditor } from './ProfileEditor.jsx';

export function ProfilePage() {
  const { user } = useAuth();
  const { profile, loading, error: loadError } = useProfile(user?.uid);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  if (loading)
    return (
      <PageContainer>
        <PageHeader
          badge="Akun"
          description="Informasi dan preferensi akunmu."
          title={APP_COPY.pageTitles.profile}
        />
        <p role="status">Memuat profil…</p>
      </PageContainer>
    );
  if (loadError)
    return (
      <PageContainer>
        <PageHeader
          badge="Akun"
          description="Informasi dan preferensi akunmu."
          title={APP_COPY.pageTitles.profile}
        />
        <SketchCard role="alert">{loadError}</SketchCard>
      </PageContainer>
    );
  if (!profile)
    return (
      <PageContainer>
        <PageHeader
          badge="Akun"
          description="Informasi dan preferensi akunmu."
          title={APP_COPY.pageTitles.profile}
        />
        <SketchCard role="status">Profil belum tersedia.</SketchCard>
      </PageContainer>
    );

  async function logout() {
    try {
      await signOutUser();
    } catch (logoutError) {
      setError(getAuthErrorMessage(logoutError));
    }
  }

  return (
    <PageContainer>
      <PageHeader
        badge="Akun"
        description="Informasi dan preferensi akunmu."
        title={APP_COPY.pageTitles.profile}
      />
      <SketchCard>
        <Row className="profile-header" gap={16}>
          {profile.photoURL ? (
            <img alt="" className="profile-avatar" src={profile.photoURL} />
          ) : (
            <div aria-hidden="true" className="profile-avatar profile-avatar-initial">
              {profile.displayName?.trim().charAt(0).toUpperCase() || '?'}
            </div>
          )}
          <Stack gap={4}>
            <h2 className="font-heading text-lg">{profile.displayName}</h2>
            <p>{profile.email || user?.email || 'Email tidak tersedia'}</p>
          </Stack>
        </Row>

        {editing ? (
          <ProfileEditor
            onCancel={() => setEditing(false)}
            onSaved={() => setEditing(false)}
            profile={profile}
            uid={user.uid}
          />
        ) : (
          <Stack gap={12}>
            <p>
              <strong>Gender:</strong> {profile.gender === 'female' ? 'Wanita' : 'Pria'}
            </p>
            <p>
              <strong>Tanggal lahir:</strong> {profile.birthDate}
            </p>
            {error ? (
              <p className="text-red-dark" role="alert">
                {error}
              </p>
            ) : null}
            <Row gap={12}>
              <SketchButton onClick={() => setEditing(true)} variant="secondary">
                Ubah profil
              </SketchButton>
              <SketchButton onClick={logout} variant="danger">
                Keluar
              </SketchButton>
            </Row>
          </Stack>
        )}
      </SketchCard>
    </PageContainer>
  );
}
