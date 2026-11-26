import { useState } from 'react';
import { MoneyInput } from '../../shared/components/MoneyInput.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchInput } from '../../shared/components/SketchField.jsx';

export function FixedBillForm({ initial, saving, error, onCancel, onSave }) {
  const [name, setName] = useState(initial?.name || '');
  const [amount, setAmount] = useState(initial?.amount ?? null);
  const [dueDay, setDueDay] = useState(String(initial?.dueDay || 1));
  const [active, setActive] = useState(initial?.active ?? true);

  async function submit(event) {
    event.preventDefault();
    const day = Number(dueDay);
    if (
      !name.trim() ||
      !Number.isSafeInteger(amount) ||
      amount <= 0 ||
      !Number.isInteger(day) ||
      day < 1 ||
      day > 31
    ) {
      return;
    }
    await onSave({ name: name.trim(), amount, dueDay: day, active });
  }

  return (
    <form className="field-stack" onSubmit={submit}>
      <SketchInput
        label="Nama tagihan"
        maxLength={60}
        onChange={(event) => setName(event.target.value)}
        required
        value={name}
      />
      <MoneyInput label="Jumlah (rupiah)" onChange={setAmount} required value={amount} />
      <SketchInput
        hint="Tanggal 29–31 otomatis menyesuaikan bulan yang lebih pendek."
        label="Tanggal jatuh tempo"
        max="31"
        min="1"
        onChange={(event) => setDueDay(event.target.value)}
        required
        type="number"
        value={dueDay}
      />
      {initial ? (
        <label className="flex min-h-11 items-center gap-3">
          <input
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            type="checkbox"
          />
          Tagihan aktif
        </label>
      ) : null}
      {error ? (
        <p className="text-red-dark" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <SketchButton disabled={saving || !name.trim()} type="submit">
          {saving ? 'Menyimpan…' : 'Simpan tagihan'}
        </SketchButton>
        <SketchButton disabled={saving} onClick={onCancel} variant="secondary">
          Batal
        </SketchButton>
      </div>
    </form>
  );
}
