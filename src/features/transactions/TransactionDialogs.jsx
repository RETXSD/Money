import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchModal } from '../../shared/components/SketchModal.jsx';
import { TransactionForm } from './TransactionForm.jsx';

export function TransactionDialogs({
  categories,
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
        title={editing ? 'Ubah transaksi' : 'Transaksi baru'}
      >
        <TransactionForm
          categories={categories}
          initial={editing}
          onCancel={onCloseForm}
          onSave={onSave}
          saving={saving}
        />
      </SketchModal>
      <SketchModal onClose={onCancelDelete} open={Boolean(deleting)} title="Hapus transaksi?">
        <p>Catatan ini akan dihapus dari riwayatmu.</p>
        {error ? (
          <p className="text-red-dark" role="alert">
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
