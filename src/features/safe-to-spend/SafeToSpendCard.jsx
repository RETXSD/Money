import { Link } from 'react-router-dom';
import { SketchBadge } from '../../shared/components/SketchFeedback.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { Row, Stack } from '../../shared/components/Layout.jsx';
import { formatRupiah } from '../../shared/utils/money.js';

function formatDueDate(date) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(date);
}

export function SafeToSpendCard({ summary: { billsDue, error, loading, safe } }) {
  if (loading) return <p role="status">Menghitung jatah harian…</p>;
  if (error) {
    return (
      <SketchCard role="alert">
        <p className="text-red-dark">{error}</p>
        <SketchButton as={Link} className="no-underline" to="/settings" variant="secondary">
          Periksa pengaturan
        </SketchButton>
      </SketchCard>
    );
  }

  const overspent = safe.remainingToday < 0;
  return (
    <SketchCard className={overspent ? 'sketch-danger' : ''} sticky={!overspent}>
      <Row className="safe-to-spend-header" gap={16}>
        <Stack className="safe-to-spend-copy" gap={8}>
          <SketchBadge variant={overspent ? 'danger' : 'warning'}>Jatah hari ini</SketchBadge>
          <p className="font-bold">
            {overspent ? 'Melewati jatah hari ini' : 'Jatah hari ini sisa'}
          </p>
          <p className="safe-amount font-heading">
            {formatRupiah(Math.abs(safe.remainingToday))}
          </p>
          <p>
            Batas harian {formatRupiah(safe.dailyAllowance)} · {safe.daysLeft} hari lagi menuju
            gajian.
          </p>
        </Stack>
        <SketchButton as={Link} className="no-underline" to="/settings" variant="secondary">
          Atur
        </SketchButton>
      </Row>

      <Stack className="safe-reservations text-sm" gap={8}>
        <p>
          Disisihkan untuk tagihan: <strong>{formatRupiah(safe.remainingBills)}</strong>
        </p>
        <p>
          Disisihkan untuk utang jatuh tempo: <strong>{formatRupiah(safe.debtsDue)}</strong>
        </p>
        {billsDue.length ? (
          <ul className="list-inside list-disc">
            {billsDue.slice(0, 3).map((bill) => (
              <li key={bill.id}>
                {bill.name} · {formatRupiah(bill.amount)} · {formatDueDate(bill.dueDate)}
              </li>
            ))}
          </ul>
        ) : null}
      </Stack>
    </SketchCard>
  );
}
