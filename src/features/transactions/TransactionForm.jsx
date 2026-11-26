import { useState } from 'react';
import { MoneyInput } from '../../shared/components/MoneyInput.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchInput, SketchSelect } from '../../shared/components/SketchField.jsx';
import { SketchTabs } from '../../shared/components/SketchTabs.jsx';
import { formatLocalDate } from '../../shared/utils/dates.js';

function dateToLocalInput(date) {
  return date instanceof Date ? formatLocalDate(date) : formatLocalDate(new Date());
}

export function TransactionForm({ categories, initial, saving, onCancel, onSave }) {
  const [amount, setAmount] = useState(initial?.amount ?? null);
  const [type, setType] = useState(initial?.type || 'expense');
  const [categoryId, setCategoryId] = useState(initial?.categoryId || '');
  const [note, setNote] = useState(initial?.note || '');
  const [date, setDate] = useState(dateToLocalInput(initial?.date));
  const [error, setError] = useState('');
  const categoryOptions = categories
    .filter((category) => category.type === type)
    .map((category) => ({ value: category.id, label: `${category.icon} ${category.name}` }));

  async function submit(event) {
    event.preventDefault();
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      setError('Masukkan jumlah dalam rupiah bulat dan lebih dari nol.');
      return;
    }
    if (!date) {
      setError('Tanggal transaksi wajib diisi.');
      return;
    }

    setError('');
    try {
      await onSave({
        amount,
        type,
        categoryId: categoryId || null,
        note: note.trim(),
        date: new Date(`${date}T12:00:00`),
      });
    } catch (saveError) {
      setError(saveError.message || 'Transaksi belum tersimpan. Coba lagi.');
    }
  }

  return (
    <form className="field-stack" onSubmit={submit}>
      <SketchTabs
        label="Jenis transaksi"
        onChange={(nextType) => {
          setType(nextType);
          if (
            !categories.some((category) => category.id === categoryId && category.type === nextType)
          ) {
            setCategoryId('');
          }
        }}
        tabs={[
          { value: 'expense', label: 'Pengeluaran' },
          { value: 'income', label: 'Pemasukan' },
        ]}
        value={type}
      />
      <MoneyInput label="Jumlah (rupiah)" onChange={setAmount} required value={amount} />
      <SketchSelect
        label="Kategori"
        onChange={(event) => setCategoryId(event.target.value)}
        options={[{ value: '', label: 'Tanpa kategori' }, ...categoryOptions]}
        value={categoryId}
      />
      <SketchInput
        label="Catatan"
        onChange={(event) => setNote(event.target.value)}
        value={note}
      />
      <SketchInput
        label="Tanggal"
        max={formatLocalDate(new Date())}
        onChange={(event) => setDate(event.target.value)}
        required
        type="date"
        value={date}
      />
      {error ? (
        <p className="text-red-dark" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <SketchButton disabled={saving} type="submit">
          {saving ? 'Menyimpan…' : 'Simpan transaksi'}
        </SketchButton>
        <SketchButton onClick={onCancel} variant="secondary">
          Batal
        </SketchButton>
      </div>
    </form>
  );
}
