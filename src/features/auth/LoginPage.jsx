import { Link } from 'react-router-dom';
import { DoodleIcon } from '../../shared/components/DoodleIcon.jsx';
import { SketchBadge } from '../../shared/components/SketchFeedback.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { SketchInput } from '../../shared/components/SketchField.jsx';

export function LoginPage() {
  return (
    <main className="login-page">
      <SketchCard className="login-card">
        <Link aria-label="Kembali ke MTRCK" className="brand justify-center" to="/">
          <span aria-hidden="true" className="brand-mark">
            m
          </span>
          <span>MTRCK</span>
        </Link>
        <div className="doodle-illustration" aria-hidden="true">
          <DoodleIcon name="wallet" />
        </div>
        <div className="text-center">
          <SketchBadge variant="warning">Ruang dompetmu</SketchBadge>
          <h1 className="page-heading mt-3">Mulai dengan tenang</h1>
          <p className="page-kicker mb-5">
            Masuk atau daftar untuk menyimpan catatan uangmu dengan aman.
          </p>
        </div>
        <div className="field-stack">
          <SketchInput disabled label="Email" placeholder="nama@email.com" type="email" />
          <SketchInput
            disabled
            label="Kata sandi"
            placeholder="Minimal 8 karakter"
            type="password"
          />
          <SketchButton className="w-full" disabled type="button">
            Lanjutkan
          </SketchButton>
        </div>
        <p className="login-footer">
          Login Google dan email akan diaktifkan pada tahap autentikasi.
        </p>
      </SketchCard>
    </main>
  );
}
