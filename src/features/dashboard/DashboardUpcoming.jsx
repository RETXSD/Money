import { Link } from 'react-router-dom';
import { EmptyState } from '../../shared/components/EmptyState.jsx';
import { SketchBadge } from '../../shared/components/SketchFeedback.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { formatRupiah } from '../../shared/utils/money.js';

function formatDueDate(date) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long' }).format(date);
}

export function DashboardUpcoming({ summary }) {
  if (summary.loading) return <p role="status">Memuat tagihan dan utang…</p>;
  if (summary.error)
    return (
      <p className="text-red-dark m-0" role="alert">
        {summary.error}
      </p>
    );

  const items = [
    ...summary.billsDue.map((bill) => ({ ...bill, kind: 'bill', personName: '' })),
    ...summary.upcomingDebts.map((debt) => ({ ...debt, kind: 'debt' })),
  ]
    .sort((left, right) => left.dueDate - right.dueDate)
    .slice(0, 5);

  return (
    <section className="page-grid">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="showcase-title mb-0">Jatuh tempo berikutnya</h2>
          <p className="mt-1 mb-0">Tagihan dan janji pembayaran di siklus ini.</p>
        </div>
        <SketchButton as={Link} className="no-underline" to="/debts" variant="secondary">
          Kelola utang
        </SketchButton>
      </header>
      {items.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <SketchCard className="p-4" key={`${item.kind}-${item.id}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <SketchBadge
                    variant={
                      item.kind === 'bill'
                        ? 'warning'
                        : item.direction === 'owed_to_me'
                          ? 'success'
                          : 'danger'
                    }
                  >
                    {item.kind === 'bill'
                      ? 'Tagihan'
                      : item.direction === 'owed_to_me'
                        ? 'Piutang'
                        : 'Utang'}
                  </SketchBadge>
                  <h3 className="mt-2 mb-0 text-xl font-bold">
                    {item.kind === 'bill' ? item.name : item.personName}
                  </h3>
                </div>
                <strong>{formatDueDate(item.dueDate)}</strong>
              </div>
              <p className="mt-2 mb-0 font-bold">
                {formatRupiah(item.kind === 'debt' ? item.amount - item.paidAmount : item.amount)}
              </p>
            </SketchCard>
          ))}
        </div>
      ) : (
        <EmptyState
          description="Tagihan rutin atau utang dengan tanggal jatuh tempo akan muncul di sini."
          icon="wallet"
          title="Belum ada yang jatuh tempo"
        />
      )}
    </section>
  );
}
