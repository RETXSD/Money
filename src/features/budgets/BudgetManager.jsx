import { useState } from 'react';
import { useAuth } from '../../app/providers/useAuth.js';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { SketchModal } from '../../shared/components/SketchModal.jsx';
import { formatRupiah } from '../../shared/utils/money.js';
import { deleteCategoryBudget, saveCategoryBudget } from './budgets.service.js';
import { BudgetForm } from './BudgetForm.jsx';

export function BudgetManager({ categories, budgets }) {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const expenseCategories = categories
    .filter((category) => category.type === 'expense')
    .sort((left, right) => left.name.localeCompare(right.name, 'id'));
  const limitByCategory = new Map(budgets.map((budget) => [budget.categoryId, budget.limit]));

  async function saveLimit(limit) {
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      await saveCategoryBudget(user.uid, selected.id, limit);
      setSelected(null);
    } catch {
      setError('Anggaran belum tersimpan. Periksa koneksi lalu coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  async function removeLimit() {
    if (!deleting) return;
    setSaving(true);
    setError('');
    try {
      await deleteCategoryBudget(user.uid, deleting.id);
      setDeleting(null);
    } catch {
      setError('Anggaran belum terhapus. Periksa koneksi lalu coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="page-grid">
      <header>
        <h2 className="showcase-title mb-0">Batas per kategori</h2>
        <p className="mt-1 mb-0">Atur berapa rupiah yang ingin kamu sisihkan untuk tiap pos.</p>
      </header>
      {error && !selected ? (
        <p className="text-red-dark m-0" role="alert">
          {error}
        </p>
      ) : null}
      <div className="budget-category-grid grid gap-3">
        {expenseCategories.map((category) => {
          const limit = limitByCategory.get(category.id);
          return (
            <SketchCard className="p-4" key={category.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="m-0 text-xl font-bold">
                    {category.icon} {category.name}
                  </h3>
                  <p className="mt-1 mb-0 text-sm">
                    {Number.isSafeInteger(limit) ? formatRupiah(limit) : 'Belum dianggarkan'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <SketchButton
                    onClick={() => {
                      setError('');
                      setSelected(category);
                    }}
                    variant={Number.isSafeInteger(limit) ? 'secondary' : 'primary'}
                  >
                    {Number.isSafeInteger(limit) ? 'Ubah batas' : 'Tambah batas'}
                  </SketchButton>
                  {Number.isSafeInteger(limit) ? (
                    <SketchButton onClick={() => setDeleting(category)} variant="danger">
                      Hapus
                    </SketchButton>
                  ) : null}
                </div>
              </div>
            </SketchCard>
          );
        })}
      </div>

      <SketchModal
        onClose={() => (saving ? null : setSelected(null))}
        open={Boolean(selected)}
        title={selected ? `Anggaran ${selected.name}` : 'Anggaran'}
      >
        {selected ? (
          <BudgetForm
            category={selected}
            error={error}
            initialLimit={limitByCategory.get(selected.id) ?? null}
            key={selected.id}
            onCancel={() => setSelected(null)}
            onSave={saveLimit}
            saving={saving}
          />
        ) : null}
      </SketchModal>

      <SketchModal onClose={() => setDeleting(null)} open={Boolean(deleting)} title="Hapus batas?">
        {deleting ? (
          <div className="field-stack">
            <p className="m-0">
              Anggaran kategori <strong>{deleting.name}</strong> akan dihapus.
            </p>
            <div className="flex flex-wrap gap-3">
              <SketchButton disabled={saving} onClick={removeLimit} variant="danger">
                {saving ? 'Menghapus…' : 'Hapus anggaran'}
              </SketchButton>
              <SketchButton disabled={saving} onClick={() => setDeleting(null)} variant="secondary">
                Batal
              </SketchButton>
            </div>
          </div>
        ) : null}
      </SketchModal>
    </section>
  );
}
