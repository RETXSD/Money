import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DoodleIcon } from '../../shared/components/DoodleIcon.jsx';
import { SketchBadge, Squiggle } from '../../shared/components/SketchFeedback.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { SketchInput } from '../../shared/components/SketchField.jsx';
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
        <div className="text-center">
          <SketchBadge variant="warning">Dompet harianmu</SketchBadge>
          <h1 className="page-heading mt-3">
            {isRegistering ? 'Bikin akun dulu' : 'Masuk dengan tenang'}
          </h1>
          <p className="page-kicker mb-5">
            Catat uangmu dengan cara yang lebih sederhana dan terasa dekat.
          </p>
        </div>

        <form className="field-stack" onSubmit={submit}>
          {isRegistering ? (
            <SketchInput
              autoComplete="name"
              label="Nama (boleh diisi sekarang)"
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
            <p className="text-red-dark m-0" role="alert">
              {error}
            </p>
          ) : null}
          <SketchButton className="w-full" disabled={busy} type="submit">
            {busy ? 'Tunggu sebentar…' : isRegistering ? 'Daftar dengan email' : 'Masuk'}
          </SketchButton>
        </form>

        <div className="text-ink/75 my-4 flex items-center gap-3 text-sm">
          <Squiggle className="text-ink/50 h-3 flex-1" />
          atau
          <Squiggle className="text-ink/50 h-3 flex-1" />
        </div>
        <SketchButton className="w-full" disabled={busy} onClick={signInGoogle} variant="secondary">
          Lanjut dengan Google
        </SketchButton>
        <p className="login-footer">
          {isRegistering ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
          <button
            className="text-blue-dark min-h-11 rounded px-2 font-bold underline underline-offset-2"
            onClick={() => {
              setMode(isRegistering ? 'login' : 'register');
              setError('');
            }}
            type="button"
          >
            {isRegistering ? 'Masuk' : 'Daftar'}
          </button>
        </p>
      </SketchCard>
    </main>
  );
}
