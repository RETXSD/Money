import { SketchModal } from '../../shared/components/SketchModal.jsx';
import { DebtForm } from './DebtForm.jsx';
import { SplitBillForm } from './SplitBillForm.jsx';

export function DebtDialogs({
  categories,
  debtError,
  debtOpen,
  onCancelDebt,
  onCancelSplit,
  onSaveDebt,
  onSaveSplit,
  people,
  saving,
  splitError,
  splitOpen,
}) {
  return (
    <>
      <SketchModal onClose={onCancelDebt} open={debtOpen} title="Catat utang atau piutang">
        <DebtForm
          error={debtError}
          onCancel={onCancelDebt}
          onSave={onSaveDebt}
          people={people}
          saving={saving}
        />
      </SketchModal>
      <SketchModal onClose={onCancelSplit} open={splitOpen} title="Bagi tagihan">
        <SplitBillForm
          categories={categories}
          error={splitError}
          onCancel={onCancelSplit}
          onSave={onSaveSplit}
          people={people}
          saving={saving}
        />
      </SketchModal>
    </>
  );
}
