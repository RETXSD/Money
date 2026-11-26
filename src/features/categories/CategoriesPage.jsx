import { useState } from 'react';
import { useAuth } from '../../app/providers/useAuth.js';
import { EmptyState } from '../../shared/components/EmptyState.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { PageContainer, PageHeader } from '../../shared/components/Layout.jsx';
import { APP_COPY } from '../../shared/constants/copy.js';
import { createCategory, deleteCategory, updateCategory } from './categories.service.js';
import { useCategories } from './hooks/useCategories.js';
import { CategoryList } from './CategoryList.jsx';
import { CategoryDialogs } from './CategoryDialogs.jsx';
import { SuggestedCategories } from './SuggestedCategories.jsx';

export function CategoriesPage() {
  const { user } = useAuth();
  const { data: categories, loading, error: loadError } = useCategories(user.uid);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  function openNewForm() {
    setEditing(null);
    setFormOpen(true);
  }

  async function saveCategory(values) {
    const duplicate = categories.some(
      (category) =>
        category.id !== editing?.id && category.name.toLowerCase() === values.name.toLowerCase(),
    );
    if (duplicate) throw new Error('Nama kategori itu sudah ada.');

    setSaving(true);
    try {
      if (editing) await updateCategory(user.uid, editing.id, values);
      else await createCategory(user.uid, values);
      setFormOpen(false);
      setEditing(null);
    } catch {
      throw new Error('Kategori belum tersimpan. Periksa koneksi lalu coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  async function addSuggestedCategory(suggestion) {
    setSaving(true);
    setError('');
    try {
      await createCategory(user.uid, suggestion);
    } catch {
      setError('Kategori belum tersimpan. Periksa koneksi lalu coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setSaving(true);
    setError('');
    try {
      await deleteCategory(user.uid, deleting.id);
      setDeleting(null);
    } catch {
      setError('Kategori belum terhapus. Periksa koneksi lalu coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        actions={<SketchButton onClick={openNewForm}>Tambah kategori</SketchButton>}
        badge="Kategori"
        description="Kelompokkan pemasukan dan pengeluaran."
        title={APP_COPY.pageTitles.categories}
      />

      <SuggestedCategories
        categories={categories}
        onAdd={addSuggestedCategory}
        saving={saving || Boolean(loadError)}
      />

      {loadError ? <SketchCard role="alert">{loadError}</SketchCard> : null}
      {error ? (
        <p className="text-red-dark" role="alert">
          {error}
        </p>
      ) : null}
      {loadError ? null : loading ? (
        <p role="status">Memuat kategori…</p>
      ) : categories.length ? (
        <CategoryList
          categories={categories}
          onDelete={setDeleting}
          onEdit={(category) => {
            setEditing(category);
            setFormOpen(true);
          }}
        />
      ) : (
        <EmptyState
          description="Tambah kategori untuk mengelompokkan transaksi pertamamu."
          title="Belum ada kategori"
        />
      )}

      <CategoryDialogs
        deleting={deleting}
        error={error}
        editing={editing}
        formOpen={formOpen}
        onCancelDelete={() => setDeleting(null)}
        onCloseForm={() => setFormOpen(false)}
        onConfirmDelete={confirmDelete}
        onSave={saveCategory}
        saving={saving}
      />
    </PageContainer>
  );
}
