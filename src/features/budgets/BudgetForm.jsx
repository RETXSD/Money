import { useState } from 'react';
import { MoneyInput } from '../../shared/components/MoneyInput.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';

export function BudgetForm({ category, initialLimit, saving, error, onCancel, onSave }) {
  const [limit, setLimit] = useState(initialLimit ?? null);

  async function submit(event) {
    event.preventDefault();
    if (!Number.isSafeInteger(limit) || limit <= 0) {
      return;
    }
    await onSave(limit);
  }

  return (
    <form className="field-stack" onSubmit={submit}>
      <MoneyInput label="Batas anggaran (rupiah)" onChange={setLimit} required value={limit} />
      <p className="text-ink text-sm">
        Batas ini berlaku untuk siklus gajian yang sedang berjalan.
      </p>
      {error ? (
        <p className="text-red-dark" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <SketchButton disabled={saving || !Number.isSafeInteger(limit) || limit <= 0} type="submit">
          {saving ? 'Menyimpan…' : `Simpan ${category.name}`}
        </SketchButton>
        <SketchButton disabled={saving} onClick={onCancel} variant="secondary">
          Batal
        </SketchButton>
      </div>
    </form>
  );
}
