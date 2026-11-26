import { Link } from 'react-router-dom';
import { EmptyState } from '../../shared/components/EmptyState.jsx';
import { SketchBadge } from '../../shared/components/SketchFeedback.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { Grid, Row, Section, Stack } from '../../shared/components/Layout.jsx';
import { formatRupiah } from '../../shared/utils/money.js';

function formatTransactionDate(date) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(date);
}

export function RecentTransactions({ transactions, categories }) {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const latest = transactions.slice(0, 5);

  return (
    <Section gap={16}>
      <Row className="section-heading" gap={16}>
        <Stack gap={4}>
          <h2 className="showcase-title">Transaksi terbaru</h2>
          <p>Catatan dari siklus gajian yang sedang berjalan.</p>
        </Stack>
        <SketchButton as={Link} className="no-underline" to="/transactions" variant="secondary">
          Semua transaksi
        </SketchButton>
      </Row>
      {latest.length ? (
        <Grid className="transaction-summary-list" gap={16}>
          {latest.map((transaction) => {
            const income = transaction.type === 'income';
            const category = categoryById.get(transaction.categoryId);
            return (
              <SketchCard key={transaction.id}>
                <Row className="transaction-summary-row" gap={16}>
                  <Stack className="transaction-summary-copy" gap={8}>
                    <Row gap={8}>
                      <SketchBadge variant={income ? 'success' : 'danger'}>
                        {income ? 'Masuk' : 'Keluar'}
                      </SketchBadge>
                      <span className="text-sm">
                        {category ? `${category.icon} ${category.name}` : 'Tanpa kategori'}
                      </span>
                    </Row>
                    <p className="truncate">{transaction.note || 'Tanpa catatan'}</p>
                  </Stack>
                  <Stack className="transaction-summary-amount" gap={4}>
                    <strong className="block text-lg">
                      {income ? '+' : '−'}
                      {formatRupiah(transaction.amount)}
                    </strong>
                    <time className="text-sm" dateTime={transaction.date.toISOString()}>
                      {formatTransactionDate(transaction.date)}
                    </time>
                  </Stack>
                </Row>
              </SketchCard>
            );
          })}
        </Grid>
      ) : (
        <EmptyState
          description="Transaksi yang kamu catat akan tampil sebagai ringkasan siklus."
          title="Belum ada transaksi"
        >
          <SketchButton as={Link} className="no-underline" to="/transactions" variant="secondary">
            Tambah transaksi
          </SketchButton>
        </EmptyState>
      )}
    </Section>
  );
}
