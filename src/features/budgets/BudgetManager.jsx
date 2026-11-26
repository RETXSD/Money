import { useState } from 'react';
import { useAuth } from '../../app/providers/useAuth.js';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { SketchModal } from '../../shared/components/SketchModal.jsx';
import { Grid, Section } from '../../shared/components/Layout.jsx';
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
  const firstUnbudgetedCategoryId = expenseCategories.find(
    (category) => !Number.isSafeInteger(limitByCategory.get(category.id)),
  )?.id;

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
    <Section gap={16}>
      <header>
        <h2 className="showcase-title">Batas per kategori</h2>
        <p>Atur berapa rupiah yang ingin kamu sisihkan untuk tiap pos.</p>
      </header>
      {error && !selected ? (
        <p className="text-red-dark" role="alert">
          {error}
        </p>
      ) : null}
      <Grid className="budget-category-grid" gap={16}>
        {expenseCategories.map((category) => {
          const limit = limitByCategory.get(category.id);
          return (
            <SketchCard key={category.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold">
                    {category.icon} {category.name}
                  </h3>
                  <p className="text-sm">
                    {Number.isSafeInteger(limit) ? formatRupiah(limit) : 'Belum dianggarkan'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <SketchButton
                    onClick={() => {
                      setError('');
                      setSelected(category);
                    }}
                    variant={category.id === firstUnbudgetedCategoryId ? 'primary' : 'secondary'}
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
      </Grid>

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
            <p>
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
    </Section>
  );
}
