import { useState } from 'react';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchInput, SketchSelect } from '../../shared/components/SketchField.jsx';

export function CategoryForm({ initial, saving, onCancel, onSave }) {
  const [name, setName] = useState(initial?.name || '');
  const [icon, setIcon] = useState(initial?.icon || '✨');
  const [type, setType] = useState(initial?.type || 'expense');
  const [keywords, setKeywords] = useState(initial?.keywords?.join(', ') || '');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    if (!name.trim()) {
      setError('Nama kategori wajib diisi.');
      return;
    }

    try {
      await onSave({
        name: name.trim(),
        icon,
        type,
        keywords: keywords
          .split(',')
          .map((keyword) => keyword.trim().toLowerCase())
          .filter(Boolean),
      });
    } catch (saveError) {
      setError(saveError.message || 'Kategori belum tersimpan. Coba lagi.');
    }
  }

  return (
    <form className="field-stack" onSubmit={submit}>
      <SketchInput
        label="Nama kategori"
        maxLength={40}
        onChange={(event) => setName(event.target.value)}
        required
        value={name}
      />
      <SketchInput
        label="Ikon emoji"
        maxLength={8}
        onChange={(event) => setIcon(event.target.value)}
        value={icon}
      />
      <SketchSelect
        label="Jenis"
        onChange={(event) => setType(event.target.value)}
        options={[
          { value: 'expense', label: 'Pengeluaran' },
          { value: 'income', label: 'Pemasukan' },
        ]}
        value={type}
      />
      <SketchInput
        hint="Pisahkan beberapa kata dengan koma."
        label="Kata kunci (opsional)"
        onChange={(event) => setKeywords(event.target.value)}
        value={keywords}
      />
      {error ? (
        <p className="text-red-dark m-0" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <SketchButton disabled={saving} type="submit">
          {saving ? 'Menyimpan…' : 'Simpan kategori'}
        </SketchButton>
        <SketchButton onClick={onCancel} variant="secondary">
          Batal
        </SketchButton>
      </div>
    </form>
  );
}
