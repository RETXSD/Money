import { formatRupiah } from '../../shared/utils/money.js';
import { SketchBadge } from '../../shared/components/SketchFeedback.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { Grid, Stack } from '../../shared/components/Layout.jsx';

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
    <Grid gap={16}>
      {groups.map((group) => (
        <Stack as="section" gap={16} key={group[0].id}>
          <h2 className="font-heading text-2xl">{formatDayLabel(group[0].date)}</h2>
          {group.map((transaction) => {
            const category = categoryById.get(transaction.categoryId);
            const isIncome = transaction.type === 'income';
            return (
              <SketchCard key={transaction.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <SketchBadge variant={isIncome ? 'success' : 'danger'}>
                        {isIncome ? 'Masuk' : 'Keluar'}
                      </SketchBadge>
                      <span className="text-ink text-sm">
                        {category ? `${category.icon} ${category.name}` : 'Tanpa kategori'}
                      </span>
                    </div>
                    <p className="truncate">{transaction.note || 'Tanpa catatan'}</p>
                  </div>
                  <strong
                    className="text-xl"
                    aria-label={`${isIncome ? 'Pemasukan' : 'Pengeluaran'} ${formatRupiah(transaction.amount)}`}
                  >
                    {isIncome ? '+' : '−'}
                    {formatRupiah(transaction.amount)}
                  </strong>
                </div>
                <div className="flex justify-end gap-2">
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
        </Stack>
      ))}
    </Grid>
  );
}
