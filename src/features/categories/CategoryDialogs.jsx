import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchModal } from '../../shared/components/SketchModal.jsx';
import { CategoryForm } from './CategoryForm.jsx';

export function CategoryDialogs({
  editing,
  deleting,
  error,
  formOpen,
  saving,
  onCloseForm,
  onSave,
  onCancelDelete,
  onConfirmDelete,
}) {
  return (
    <>
      <SketchModal
        onClose={onCloseForm}
        open={formOpen}
        title={editing ? 'Ubah kategori' : 'Kategori baru'}
      >
        <CategoryForm initial={editing} onCancel={onCloseForm} onSave={onSave} saving={saving} />
      </SketchModal>
      <SketchModal onClose={onCancelDelete} open={Boolean(deleting)} title="Hapus kategori?">
        <p className="mt-0">
          Transaksi lama akan tetap ada, tetapi tidak lagi memakai kategori ini.
        </p>
        {error ? (
          <p className="text-red-dark m-0" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <SketchButton disabled={saving} onClick={onConfirmDelete} variant="danger">
            {saving ? 'Menghapus…' : 'Ya, hapus'}
          </SketchButton>
          <SketchButton onClick={onCancelDelete} variant="secondary">
            Batal
          </SketchButton>
        </div>
      </SketchModal>
    </>
  );
}
