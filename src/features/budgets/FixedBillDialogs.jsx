import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchModal } from '../../shared/components/SketchModal.jsx';
import { FixedBillForm } from './FixedBillForm.jsx';

export function FixedBillDialogs({
  deleting,
  error,
  onCancelDelete,
  onCancelForm,
  onDelete,
  onSave,
  saving,
  selected,
}) {
  return (
    <>
      <SketchModal
        onClose={() => (saving ? null : onCancelForm())}
        open={selected !== undefined}
        title={selected?.id ? 'Ubah tagihan' : 'Tagihan baru'}
      >
        {selected !== undefined ? (
          <FixedBillForm
            error={error}
            initial={selected || null}
            key={selected?.id || 'new'}
            onCancel={onCancelForm}
            onSave={onSave}
            saving={saving}
          />
        ) : null}
      </SketchModal>

      <SketchModal onClose={onCancelDelete} open={Boolean(deleting)} title="Hapus tagihan?">
        {deleting ? (
          <div className="field-stack">
            <p className="m-0">
              Hapus tagihan rutin <strong>{deleting.name}</strong>?
            </p>
            {error ? (
              <p className="text-red-dark m-0" role="alert">
                {error}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <SketchButton disabled={saving} onClick={onDelete} variant="danger">
                {saving ? 'Menghapus…' : 'Hapus tagihan'}
              </SketchButton>
              <SketchButton disabled={saving} onClick={onCancelDelete} variant="secondary">
                Batal
              </SketchButton>
            </div>
          </div>
        ) : null}
      </SketchModal>
    </>
  );
}
