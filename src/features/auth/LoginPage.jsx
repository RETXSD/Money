import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DoodleIcon } from '../../shared/components/DoodleIcon.jsx';
import { Squiggle } from '../../shared/components/SketchFeedback.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { SketchInput } from '../../shared/components/SketchField.jsx';
import { PageContainer, PageHeader, Row, Stack } from '../../shared/components/Layout.jsx';
import {
  getAuthErrorMessage,
  registerWithEmail,
  signInWithEmail,
  signInWithGoogle,
} from './auth.service.js';

export function LoginPage() {
  const [mode, setMode] = useState('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isRegistering = mode === 'register';

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      if (isRegistering) await registerWithEmail(email, password, displayName);
      else await signInWithEmail(email, password);
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setBusy(false);
    }
  }

  async function signInGoogle() {
    setBusy(true);
    setError('');

    try {
      await signInWithGoogle();
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <PageContainer className="login-layout" gap={24}>
        <SketchCard className="login-card">
          <Link aria-label="Kembali ke MTRCK" className="brand justify-center" to="/">
            <span aria-hidden="true" className="brand-mark">
              m
            </span>
            <span>MTRCK</span>
          </Link>
          <div aria-hidden="true" className="doodle-illustration">
            <DoodleIcon name="wallet" />
          </div>
          <PageHeader
            className="auth-page-header"
            badge="Dompet harian"
            badgeVariant="warning"
            description="Catat pemasukan, pengeluaran, dan anggaran."
            title={isRegistering ? 'Daftar akun' : 'Masuk'}
          />

          <form className="field-stack" onSubmit={submit}>
            {isRegistering ? (
              <SketchInput
                autoComplete="name"
                label="Nama"
                maxLength={50}
                onChange={(event) => setDisplayName(event.target.value)}
                value={displayName}
              />
            ) : null}
            <SketchInput
              autoComplete="email"
              label="Email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
            <SketchInput
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              label="Kata sandi"
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
            {error ? (
              <p className="text-red-dark" role="alert">
                {error}
              </p>
            ) : null}
            <div className="form-submit-row">
              <SketchButton className="w-full" disabled={busy} type="submit">
                {busy ? 'Tunggu sebentar…' : isRegistering ? 'Daftar dengan email' : 'Masuk'}
              </SketchButton>
            </div>
          </form>

          <Row className="auth-divider text-sm" gap={12}>
            <Squiggle className="text-ink h-3 flex-1" />
            atau
            <Squiggle className="text-ink h-3 flex-1" />
          </Row>
          <SketchButton className="w-full" disabled={busy} onClick={signInGoogle} variant="secondary">
            Lanjut dengan Google
          </SketchButton>
          <Stack className="login-footer" gap={4}>
            <span>{isRegistering ? 'Sudah punya akun?' : 'Belum punya akun?'}</span>
            <SketchButton
              onClick={() => {
                setMode(isRegistering ? 'login' : 'register');
                setError('');
              }}
              variant="secondary"
              type="button"
            >
              {isRegistering ? 'Masuk' : 'Daftar'}
            </SketchButton>
          </Stack>
        </SketchCard>
      </PageContainer>
    </main>
  );
}
