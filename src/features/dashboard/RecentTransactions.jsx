import { Link } from 'react-router-dom';
import { EmptyState } from '../../shared/components/EmptyState.jsx';
import { SketchBadge } from '../../shared/components/SketchFeedback.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { formatRupiah } from '../../shared/utils/money.js';

function formatTransactionDate(date) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(date);
}

export function RecentTransactions({ transactions, categories }) {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const latest = transactions.slice(0, 5);

  return (
    <section className="page-grid">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="showcase-title mb-0">Transaksi terbaru</h2>
          <p className="mt-1 mb-0">Catatan dari siklus gajian yang sedang berjalan.</p>
        </div>
        <SketchButton as={Link} className="no-underline" to="/transactions" variant="secondary">
          Semua transaksi
        </SketchButton>
      </header>
      {latest.length ? (
        <div className="grid gap-2">
          {latest.map((transaction) => {
            const income = transaction.type === 'income';
            const category = categoryById.get(transaction.categoryId);
            return (
              <SketchCard className="p-3" key={transaction.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <SketchBadge variant={income ? 'success' : 'danger'}>
                        {income ? 'Masuk' : 'Keluar'}
                      </SketchBadge>
                      <span className="text-sm">
                        {category ? `${category.icon} ${category.name}` : 'Tanpa kategori'}
                      </span>
                    </div>
                    <p className="mt-1 mb-0 truncate">{transaction.note || 'Tanpa catatan'}</p>
                  </div>
                  <div className="text-right">
                    <strong className="block text-lg">
                      {income ? '+' : '−'}
                      {formatRupiah(transaction.amount)}
                    </strong>
                    <time className="text-sm" dateTime={transaction.date.toISOString()}>
                      {formatTransactionDate(transaction.date)}
                    </time>
                  </div>
                </div>
              </SketchCard>
            );
          })}
        </div>
      ) : (
        <EmptyState
          description="Transaksi yang kamu catat akan tampil sebagai ringkasan siklus."
          title="Belum ada transaksi"
        >
          <SketchButton as={Link} className="no-underline" to="/transactions">
            Tambah transaksi
          </SketchButton>
        </EmptyState>
      )}
    </section>
  );
}
