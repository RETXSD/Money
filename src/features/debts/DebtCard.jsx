import { Link } from 'react-router-dom';
import { SketchBadge } from '../../shared/components/SketchFeedback.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { formatRupiah } from '../../shared/utils/money.js';

function formatDate(date) {
  return date
    ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(
        date,
      )
    : 'Belum ditentukan';
}

export function DebtCard({ debt, person, onWhatsApp }) {
  const isReceivable = debt.direction === 'owed_to_me';
  const remaining = debt.amount - debt.paidAmount;
  return (
    <SketchCard className="p-4" key={debt.id}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="m-0 text-xl font-bold">{person?.name || 'Orang tidak ditemukan'}</h3>
            <SketchBadge variant={isReceivable ? 'success' : 'danger'}>
              {isReceivable ? 'Piutang' : 'Utang'}
            </SketchBadge>
            {debt.status === 'settled' ? <SketchBadge variant="info">Lunas</SketchBadge> : null}
          </div>
          <p className="mt-1 mb-0">
            Sisa <strong>{formatRupiah(remaining)}</strong> dari {formatRupiah(debt.amount)}
          </p>
          <p className="mt-1 mb-0 text-sm">Jatuh tempo: {formatDate(debt.dueDate)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SketchButton
            as={Link}
            className="no-underline"
            to={`/debts/${debt.id}`}
            variant="secondary"
          >
            Detail
          </SketchButton>
          <SketchButton onClick={() => onWhatsApp(debt, person)} variant="secondary">
            WhatsApp
          </SketchButton>
        </div>
      </div>
    </SketchCard>
  );
}
