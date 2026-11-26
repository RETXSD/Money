import { Link } from 'react-router-dom';
import { SketchBadge } from '../../shared/components/SketchFeedback.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { formatRupiah } from '../../shared/utils/money.js';

function formatDueDate(date) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(date);
}

export function SafeToSpendCard({ summary: { billsDue, error, loading, safe } }) {
  if (loading) return <p role="status">Menghitung jatah harian…</p>;
  if (error) {
    return (
      <SketchCard role="alert">
        <p className="text-red-dark m-0">{error}</p>
        <Link className="mt-3 inline-flex no-underline" to="/settings">
          <SketchButton variant="secondary">Periksa pengaturan</SketchButton>
        </Link>
      </SketchCard>
    );
  }

  const overspent = safe.remainingToday < 0;
  return (
    <SketchCard className={overspent ? '!bg-red' : 'sketch-success'} sticky={!overspent}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SketchBadge variant={overspent ? 'danger' : 'warning'}>Jatah hari ini</SketchBadge>
          <p className="mt-3 mb-1 font-bold">
            {overspent ? 'Melewati jatah hari ini' : 'Jatah hari ini sisa'}
          </p>
          <p className="safe-amount font-heading m-0 text-4xl leading-tight">
            {formatRupiah(Math.abs(safe.remainingToday))}
          </p>
          <p className="mt-2 mb-0">
            Batas harian {formatRupiah(safe.dailyAllowance)} · {safe.daysLeft} hari lagi menuju
            gajian.
          </p>
        </div>
        <Link className="inline-flex no-underline" to="/settings">
          <SketchButton variant="secondary">Atur</SketchButton>
        </Link>
      </div>

      <div className="mt-4 grid gap-1 text-sm">
        <p className="m-0">
          Disisihkan untuk tagihan: <strong>{formatRupiah(safe.remainingBills)}</strong>
        </p>
        <p className="m-0">
          Disisihkan untuk utang jatuh tempo: <strong>{formatRupiah(safe.debtsDue)}</strong>
        </p>
        {billsDue.length ? (
          <ul className="m-0 list-inside list-disc p-0">
            {billsDue.slice(0, 3).map((bill) => (
              <li key={bill.id}>
                {bill.name} · {formatRupiah(bill.amount)} · {formatDueDate(bill.dueDate)}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </SketchCard>
  );
}
