import { useState } from 'react';
import { useAuth } from '../../app/providers/useAuth.js';
import { DoodleIcon } from '../../shared/components/DoodleIcon.jsx';
import { SketchBadge } from '../../shared/components/SketchFeedback.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { SketchInput } from '../../shared/components/SketchField.jsx';
import { formatLocalDate } from '../../shared/utils/dates.js';
import { validateProfile } from '../../shared/utils/profileValidation.js';
import { completeOnboarding } from './profile.service.js';

export function OnboardingPage() {
  const { user } = useAuth();
  const [values, setValues] = useState({
    displayName: user?.displayName || '',
    gender: '',
    birthDate: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const validation = validateProfile(values, new Date());

  function updateValue(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!validation.valid || !user) return;

    setSaving(true);
    setError('');
    try {
      await completeOnboarding({
        uid: user.uid,
        profile: {
          ...values,
          email: user.email,
          photoURL: user.photoURL,
        },
      });
    } catch {
      setError('Profil belum tersimpan. Periksa koneksi lalu coba lagi.');
      setSaving(false);
    }
  }

  return (
    <main className="login-page">
      <SketchCard className="login-card">
        <div aria-hidden="true" className="doodle-illustration">
          <DoodleIcon name="wallet" />
        </div>
        <div className="text-center">
          <SketchBadge variant="warning">Satu langkah kecil</SketchBadge>
          <h1 className="page-heading mt-3">Kenali dompetmu</h1>
          <p className="page-kicker mb-5">
            Lengkapi profil dulu supaya sapaan dan pengingat terasa lebih personal.
          </p>
        </div>

        <form className="field-stack" onSubmit={submit}>
          <SketchInput
            autoComplete="name"
            label="Nama panggilan"
            maxLength={50}
            onChange={(event) => updateValue('displayName', event.target.value)}
            required
            value={values.displayName}
          />
          {validation.errors.displayName ? (
            <p className="text-red-dark m-0" role="alert">
              {validation.errors.displayName}
            </p>
          ) : null}

          <fieldset className="m-0 grid gap-2 border-0 p-0">
            <legend className="mb-1 font-bold">Gender</legend>
            <div aria-label="Pilih gender" className="grid grid-cols-2 gap-3" role="radiogroup">
              {[
                { value: 'female', label: 'Wanita', emoji: '🌷' },
                { value: 'male', label: 'Pria', emoji: '🌿' },
              ].map((option) => (
                <label
                  className={`sketch-radio-card ${values.gender === option.value ? 'bg-blue' : 'bg-card'}`}
                  key={option.value}
                >
                  <input
                    aria-invalid={Boolean(validation.errors.gender)}
                    checked={values.gender === option.value}
                    className="sr-only"
                    name="gender"
                    onChange={() => updateValue('gender', option.value)}
                    type="radio"
                    value={option.value}
                  />
                  <span aria-hidden="true" className="text-2xl">
                    {option.emoji}
                  </span>
                  <span className="font-bold">{option.label}</span>
                </label>
              ))}
            </div>
            {validation.errors.gender ? (
              <p className="text-red-dark m-0" role="alert">
                {validation.errors.gender}
              </p>
            ) : null}
          </fieldset>

          <SketchInput
            label="Tanggal lahir"
            max={formatLocalDate(new Date())}
            onChange={(event) => updateValue('birthDate', event.target.value)}
            required
            type="date"
            value={values.birthDate}
          />
          <p className="text-ink/75 m-0 text-sm">
            Tanggal lahir dipakai untuk sapaan dan ucapan ulang tahun.
          </p>
          {validation.errors.birthDate ? (
            <p className="text-red-dark m-0" role="alert">
              {validation.errors.birthDate}
            </p>
          ) : null}
          {error ? (
            <p className="text-red-dark m-0" role="alert">
              {error}
            </p>
          ) : null}

          <SketchButton
            className="mt-2 w-full"
            disabled={!validation.valid || saving}
            type="submit"
          >
            {saving ? 'Menyimpan profil…' : 'Simpan dan lanjutkan'}
          </SketchButton>
        </form>
      </SketchCard>
    </main>
  );
}
