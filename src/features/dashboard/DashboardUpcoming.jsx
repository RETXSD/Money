import { Link } from 'react-router-dom';
import { EmptyState } from '../../shared/components/EmptyState.jsx';
import { SketchBadge } from '../../shared/components/SketchFeedback.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { formatRupiah } from '../../shared/utils/money.js';
import { Grid, Row, Section, Stack } from '../../shared/components/Layout.jsx';

function formatDueDate(date) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long' }).format(date);
}

export function DashboardUpcoming({ summary }) {
  if (summary.loading) return <p role="status">Memuat tagihan dan utang…</p>;
  if (summary.error)
    return (
      <p className="text-red-dark" role="alert">
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
    <Section gap={16}>
      <Row className="section-heading" gap={16}>
        <Stack gap={4}>
          <h2 className="showcase-title">Jatuh tempo berikutnya</h2>
          <p>Tagihan dan janji pembayaran di siklus ini.</p>
        </Stack>
        <SketchButton as={Link} className="no-underline" to="/debts" variant="secondary">
          Kelola utang
        </SketchButton>
      </Row>
      {items.length ? (
        <Grid className="upcoming-list" gap={16}>
          {items.map((item) => (
            <SketchCard key={`${item.kind}-${item.id}`}>
              <Row className="upcoming-heading" gap={12}>
                <Stack className="upcoming-item-name" gap={8}>
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
                  <h3 className="text-lg font-bold">
                    {item.kind === 'bill' ? item.name : item.personName}
                  </h3>
                </Stack>
                <strong>{formatDueDate(item.dueDate)}</strong>
              </Row>
              <p className="font-bold">
                {formatRupiah(item.kind === 'debt' ? item.amount - item.paidAmount : item.amount)}
              </p>
            </SketchCard>
          ))}
        </Grid>
      ) : (
        <EmptyState
          description="Tagihan rutin atau utang dengan tanggal jatuh tempo akan muncul di sini."
          icon="wallet"
          title="Belum ada yang jatuh tempo"
        />
      )}
    </Section>
  );
}
