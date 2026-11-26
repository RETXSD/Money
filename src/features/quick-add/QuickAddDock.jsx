import { useState } from 'react';
import { useAuth } from '../../app/providers/useAuth.js';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { SketchInput } from '../../shared/components/SketchField.jsx';
import { useCategories } from '../categories/hooks/useCategories.js';
import { useQuickAdd } from './hooks/useQuickAdd.js';
import { QuickAddPreview } from './QuickAddPreview.jsx';

export function QuickAddDock() {
  const { user } = useAuth();
  const { data: categories } = useCategories(user.uid);
  const [text, setText] = useState('');
  const quickAdd = useQuickAdd(user.uid);

  function submit(event) {
    event.preventDefault();
    quickAdd.parse(text, { categories, people: [], today: new Date() });
  }

  async function save(options) {
    if (await quickAdd.save(options)) setText('');
  }

  return (
    <>
      <div className="quick-add-dock">
        <SketchCard className="shadow-sketch p-3">
          <form
            className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
            onSubmit={submit}
          >
            <SketchInput
              autoComplete="off"
              label="Tambah cepat"
              onChange={(event) => setText(event.target.value)}
              placeholder="Contoh: beli kopi 25rb"
              value={text}
            />
            <SketchButton className="w-full sm:w-auto" type="submit">
              Buat catatan
            </SketchButton>
          </form>
          <p className="mt-1 mb-0 text-sm">
            Contoh: gajian 5jt · bensin 50.000 · kemarin makan 35k
          </p>
          {quickAdd.error && !quickAdd.preview ? (
            <p className="text-red-dark mt-1 mb-0" role="alert">
              {quickAdd.error}
            </p>
          ) : null}
          {quickAdd.success ? (
            <p className="text-green-dark mt-1 mb-0" role="status">
              {quickAdd.success}
            </p>
          ) : null}
        </SketchCard>
      </div>
      <QuickAddPreview
        categories={categories}
        error={quickAdd.error}
        onChange={quickAdd.updatePreview}
        onClose={quickAdd.clear}
        onSave={save}
        preview={quickAdd.preview}
        saving={quickAdd.saving}
      />
    </>
  );
}
