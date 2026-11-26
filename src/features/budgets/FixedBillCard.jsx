import { SketchBadge } from '../../shared/components/SketchFeedback.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { formatRupiah } from '../../shared/utils/money.js';

export function FixedBillCard({ bill, paid, saving, onMarkPaid, onEdit, onDelete }) {
  return (
    <SketchCard key={bill.id}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold">{bill.name}</h3>
            <SketchBadge variant={bill.active ? (paid ? 'success' : 'warning') : 'info'}>
              {bill.active
                ? paid
                  ? 'Lunas siklus ini'
                  : `Jatuh tempo tgl ${bill.dueDay}`
                : 'Nonaktif'}
            </SketchBadge>
          </div>
          <p className="font-bold">{formatRupiah(bill.amount)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {bill.active && !paid ? (
            <SketchButton disabled={saving} onClick={onMarkPaid} variant="secondary">
              Tandai lunas
            </SketchButton>
          ) : null}
          <SketchButton onClick={onEdit} variant="secondary">
            Ubah
          </SketchButton>
          <SketchButton onClick={onDelete} variant="danger">
            Hapus
          </SketchButton>
        </div>
      </div>
    </SketchCard>
  );
}
