import { useState } from 'react';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchInput, SketchSelect } from '../../shared/components/SketchField.jsx';
import { formatLocalDate } from '../../shared/utils/dates.js';
import { validateProfile } from '../../shared/utils/profileValidation.js';
import { getAuthErrorMessage } from './auth.service.js';
import { updateProfile } from './profile.service.js';

export function ProfileEditor({ uid, profile, onCancel, onSaved }) {
  const [values, setValues] = useState({
    displayName: profile.displayName || '',
    gender: profile.gender || '',
    birthDate: profile.birthDate || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const validation = validateProfile(values, new Date());

  async function save(event) {
    event.preventDefault();
    if (!validation.valid) return;
    setSaving(true);
    setError('');
    try {
      await updateProfile(uid, values);
      onSaved();
    } catch (updateError) {
      setError(getAuthErrorMessage(updateError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="field-stack" onSubmit={save}>
      <SketchInput
        label="Nama panggilan"
        maxLength={50}
        onChange={(event) => setValues({ ...values, displayName: event.target.value })}
        required
        value={values.displayName}
      />
      <SketchSelect
        label="Gender"
        onChange={(event) => setValues({ ...values, gender: event.target.value })}
        options={[
          { value: '', label: 'Pilih gender' },
          { value: 'female', label: 'Wanita' },
          { value: 'male', label: 'Pria' },
        ]}
        value={values.gender}
      />
      <SketchInput
        label="Tanggal lahir"
        max={formatLocalDate(new Date())}
        onChange={(event) => setValues({ ...values, birthDate: event.target.value })}
        required
        type="date"
        value={values.birthDate}
      />
      {Object.values(validation.errors).map((message) => (
        <p className="text-red-dark m-0" key={message} role="alert">
          {message}
        </p>
      ))}
      {error ? (
        <p className="text-red-dark m-0" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <SketchButton disabled={!validation.valid || saving} type="submit">
          {saving ? 'Menyimpan…' : 'Simpan perubahan'}
        </SketchButton>
        <SketchButton onClick={onCancel} variant="secondary">
          Batal
        </SketchButton>
      </div>
    </form>
  );
}
