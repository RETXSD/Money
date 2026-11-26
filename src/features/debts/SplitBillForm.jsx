import { useState } from 'react';
import { MoneyInput } from '../../shared/components/MoneyInput.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchSelect } from '../../shared/components/SketchField.jsx';
import { SketchTabs } from '../../shared/components/SketchTabs.jsx';
import { splitBill } from './splitBill.js';
import { SplitBillCustomShares } from './SplitBillCustomShares.jsx';

export function SplitBillForm({ people, categories, saving, error, onCancel, onSave }) {
  const [total, setTotal] = useState(null);
  const [categoryId, setCategoryId] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [mode, setMode] = useState('equal');
  const [ownShare, setOwnShare] = useState(null);
  const [customShares, setCustomShares] = useState({});
  const [validationError, setValidationError] = useState('');
  const expenseCategories = categories
    .filter((category) => category.type === 'expense')
    .map((category) => ({ value: category.id, label: `${category.icon} ${category.name}` }));
  const selectedPeople = people.filter((person) => selectedIds.includes(person.id));

  function togglePerson(personId) {
    setSelectedIds((current) =>
      current.includes(personId) ? current.filter((id) => id !== personId) : [...current, personId],
    );
  }

  async function submit(event) {
    event.preventDefault();
    if (!Number.isSafeInteger(total) || total <= 0 || !categoryId || selectedPeople.length === 0) {
      setValidationError('Isi total, kategori, dan pilih setidaknya satu teman.');
      return;
    }
    const participants = [
      { isMe: true, name: 'Saya', ...(mode === 'custom' ? { amount: ownShare ?? 0 } : {}) },
      ...selectedPeople.map((person) => ({
        personId: person.id,
        name: person.name,
        ...(mode === 'custom' ? { amount: customShares[person.id] ?? 0 } : {}),
      })),
    ];
    try {
      const shares = splitBill({ total, participants, mode });
      setValidationError('');
      await onSave({ total, categoryId, shares, date: new Date() });
    } catch (splitError) {
      setValidationError(splitError.message || 'Periksa lagi jumlah pembagian tagihan.');
    }
  }

  return (
    <form className="field-stack" onSubmit={submit}>
      <MoneyInput label="Total tagihan (rupiah)" onChange={setTotal} required value={total} />
      <SketchSelect
        label="Kategori bagian saya"
        onChange={(event) => setCategoryId(event.target.value)}
        options={[{ value: '', label: 'Pilih kategori' }, ...expenseCategories]}
        value={categoryId}
      />
      <fieldset className="m-0 grid gap-2 border-0 p-0">
        <legend className="font-bold">Pilih teman patungan</legend>
        {people.length ? (
          <div className="grid gap-1">
            {people.map((person) => (
              <label className="flex min-h-11 items-center gap-3" key={person.id}>
                <input
                  checked={selectedIds.includes(person.id)}
                  onChange={() => togglePerson(person.id)}
                  type="checkbox"
                />
                {person.name}
              </label>
            ))}
          </div>
        ) : (
          <p className="m-0">Tambahkan teman lewat form utang sebelum membuat patungan.</p>
        )}
      </fieldset>
      <SketchTabs
        label="Cara membagi"
        onChange={setMode}
        tabs={[
          { value: 'equal', label: 'Bagi rata' },
          { value: 'custom', label: 'Atur sendiri' },
        ]}
        value={mode}
      />
      {mode === 'custom' ? (
        <SplitBillCustomShares
          ownShare={ownShare}
          onOwnShareChange={setOwnShare}
          onShareChange={(personId, amount) =>
            setCustomShares((current) => ({ ...current, [personId]: amount }))
          }
          people={selectedPeople}
          shares={customShares}
        />
      ) : null}
      {validationError || error ? (
        <p className="text-red-dark m-0" role="alert">
          {validationError || error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <SketchButton disabled={saving} type="submit">
          {saving ? 'Menyimpan…' : 'Simpan patungan'}
        </SketchButton>
        <SketchButton disabled={saving} onClick={onCancel} variant="secondary">
          Batal
        </SketchButton>
      </div>
    </form>
  );
}
