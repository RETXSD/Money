import { formatRupiah } from '../../shared/utils/money.js';
import { SketchBadge } from '../../shared/components/SketchFeedback.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';

function formatDayLabel(date) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function groupByDay(transactions) {
  const groups = new Map();
  for (const transaction of transactions) {
    if (!(transaction.date instanceof Date)) continue;
    const key = `${transaction.date.getFullYear()}-${transaction.date.getMonth()}-${transaction.date.getDate()}`;
    groups.set(key, [...(groups.get(key) || []), transaction]);
  }
  return [...groups.values()];
}

export function TransactionList({ transactions, categories, onEdit, onDelete }) {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const groups = groupByDay(transactions);

  return (
    <div className="grid gap-5">
      {groups.map((group) => (
        <section className="grid gap-3" key={group[0].id}>
          <h2 className="font-heading m-0 text-2xl">{formatDayLabel(group[0].date)}</h2>
          {group.map((transaction) => {
            const category = categoryById.get(transaction.categoryId);
            const isIncome = transaction.type === 'income';
            return (
              <SketchCard className="p-4" key={transaction.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <SketchBadge variant={isIncome ? 'success' : 'danger'}>
                        {isIncome ? 'Masuk' : 'Keluar'}
                      </SketchBadge>
                      <span className="text-ink/75 text-sm">
                        {category ? `${category.icon} ${category.name}` : 'Tanpa kategori'}
                      </span>
                    </div>
                    <p className="m-0 truncate">{transaction.note || 'Tanpa catatan'}</p>
                  </div>
                  <strong
                    className="text-xl"
                    aria-label={`${isIncome ? 'Pemasukan' : 'Pengeluaran'} ${formatRupiah(transaction.amount)}`}
                  >
                    {isIncome ? '+' : '−'}
                    {formatRupiah(transaction.amount)}
                  </strong>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <SketchButton
                    aria-label={`Ubah transaksi ${transaction.note || 'tanpa catatan'}`}
                    onClick={() => onEdit(transaction)}
                    variant="secondary"
                  >
                    Ubah
                  </SketchButton>
                  <SketchButton
                    aria-label={`Hapus transaksi ${transaction.note || 'tanpa catatan'}`}
                    onClick={() => onDelete(transaction)}
                    variant="danger"
                  >
                    Hapus
                  </SketchButton>
                </div>
              </SketchCard>
            );
          })}
        </section>
      ))}
    </div>
  );
}
