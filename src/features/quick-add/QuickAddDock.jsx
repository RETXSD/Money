import { useState } from 'react';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { SketchInput } from '../../shared/components/SketchField.jsx';
import { useQuickAdd } from './hooks/useQuickAdd.js';
import { QuickAddPreview } from './QuickAddPreview.jsx';
import { formatRupiah } from '../../shared/utils/money.js';
import { usePeople } from '../debts/hooks/usePeople.js';
import { useDebts } from '../debts/hooks/useDebts.js';

export function QuickAddDock({ categories = [], safeToSpend, budgetSummary, uid }) {
  const [text, setText] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const quickAdd = useQuickAdd(uid);
  const people = usePeople(uid);
  const debts = useDebts(uid);

  function submit(event) {
    event.preventDefault();
    quickAdd.parse(text, { categories, people: people.data, today: new Date() });
  }

  async function save(options) {
    const saved = quickAdd.preview;
    if (
      await quickAdd.save({
        ...options,
        people: people.data,
        debts: debts.data,
        peopleLoading: people.loading,
        debtsLoading: debts.loading,
      })
    ) {
      setText('');
      setLastSaved(saved);
    }
  }

  return (
    <>
      <div className="quick-add-dock">
        <SketchCard>
          <form
            className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
            onSubmit={submit}
          >
            <SketchInput
              autoComplete="off"
              label="Tambah cepat"
              onChange={(event) => setText(event.target.value)}
              value={text}
            />
            <SketchButton className="w-full sm:w-auto" type="submit">
              Tinjau
            </SketchButton>
          </form>
          <p className="text-sm">
            Contoh: gajian 5jt · bensin 50.000 · kemarin makan 35k
          </p>
          {quickAdd.error && !quickAdd.preview ? (
            <p className="text-red-dark" role="alert">
              {quickAdd.error}
            </p>
          ) : null}
          {quickAdd.success ? (
            <p className="text-green-dark" role="status">
              {quickAdd.success}{' '}
              {!safeToSpend.loading && !safeToSpend.error
                ? `Jatah hari ini sisa ${formatRupiah(safeToSpend.safe.remainingToday)}.`
                : ''}{' '}
              {lastSaved?.categoryId && !budgetSummary.loading
                ? (() => {
                    const categoryBudget = budgetSummary.progress.find(
                      (item) => item.category.id === lastSaved.categoryId,
                    );
                    return categoryBudget
                      ? `${categoryBudget.category.name} sisa ${formatRupiah(categoryBudget.remaining)}.`
                      : '';
                  })()
                : ''}
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
