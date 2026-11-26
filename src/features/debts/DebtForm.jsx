import { useState } from 'react';
import { MoneyInput } from '../../shared/components/MoneyInput.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchInput, SketchSelect } from '../../shared/components/SketchField.jsx';
import { SketchTabs } from '../../shared/components/SketchTabs.jsx';
import { formatLocalDate } from '../../shared/utils/dates.js';

export function DebtForm({ people, saving, error, onCancel, onSave }) {
  const [personId, setPersonId] = useState('');
  const [personName, setPersonName] = useState('');
  const [phone, setPhone] = useState('');
  const [direction, setDirection] = useState('owed_to_me');
  const [amount, setAmount] = useState(null);
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [affectsCash, setAffectsCash] = useState(true);
  const [validationError, setValidationError] = useState('');

  async function submit(event) {
    event.preventDefault();
    if (!personId && !personName.trim()) {
      setValidationError('Pilih teman atau isi nama orang baru.');
      return;
    }
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      setValidationError('Masukkan jumlah rupiah bulat yang lebih dari nol.');
      return;
    }
    setValidationError('');
    await onSave({
      personId: personId || null,
      personName,
      phone,
      direction,
      amount,
      dueDate: dueDate ? new Date(`${dueDate}T12:00:00`) : null,
      note: note.trim(),
      affectsCash,
    });
  }

  return (
    <form className="field-stack" onSubmit={submit}>
      <SketchSelect
        label="Pilih teman"
        onChange={(event) => setPersonId(event.target.value)}
        options={[
          { value: '', label: 'Tambah orang baru' },
          ...people.map((person) => ({ value: person.id, label: person.name })),
        ]}
        value={personId}
      />
      {!personId ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <SketchInput
            autoComplete="name"
            label="Nama orang"
            maxLength={50}
            onChange={(event) => setPersonName(event.target.value)}
            required
            value={personName}
          />
          <SketchInput
            autoComplete="tel"
            label="Nomor WhatsApp (opsional)"
            onChange={(event) => setPhone(event.target.value)}
            type="tel"
            value={phone}
          />
        </div>
      ) : null}
      <SketchTabs
        label="Arah utang"
        onChange={setDirection}
        tabs={[
          { value: 'owed_to_me', label: 'Piutang ke saya' },
          { value: 'i_owe', label: 'Saya berutang' },
        ]}
        value={direction}
      />
      <MoneyInput label="Jumlah (rupiah)" onChange={setAmount} required value={amount} />
      <SketchInput
        label="Tanggal jatuh tempo (opsional)"
        min={formatLocalDate(new Date())}
        onChange={(event) => setDueDate(event.target.value)}
        type="date"
        value={dueDate}
      />
      <SketchInput label="Catatan" onChange={(event) => setNote(event.target.value)} value={note} />
      <label className="flex min-h-11 items-center gap-3">
        <input
          checked={affectsCash}
          onChange={(event) => setAffectsCash(event.target.checked)}
          type="checkbox"
        />
        Uang tunai berpindah sekarang
      </label>
      {validationError || error ? (
        <p className="text-red-dark m-0" role="alert">
          {validationError || error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <SketchButton disabled={saving} type="submit">
          {saving ? 'Menyimpan…' : 'Simpan utang'}
        </SketchButton>
        <SketchButton disabled={saving} onClick={onCancel} variant="secondary">
          Batal
        </SketchButton>
      </div>
    </form>
  );
}
