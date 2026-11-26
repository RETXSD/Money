import { Link } from 'react-router-dom';
import { EmptyState } from '../../shared/components/EmptyState.jsx';
import { SketchBadge, SketchProgress } from '../../shared/components/SketchFeedback.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { formatRupiah } from '../../shared/utils/money.js';

const statusLabel = { green: 'Aman', yellow: 'Hati-hati', red: 'Melebihi batas' };
const statusVariant = { green: 'success', yellow: 'warning', red: 'danger' };

export function BudgetProgressList({ progress, compact = false }) {
  if (!progress.length) {
    return (
      <EmptyState
        description="Pilih batas untuk kategori pengeluaran supaya kamu tahu sisa uang di tiap pos."
        icon="chart"
        title="Belum ada anggaran"
      >
        <SketchButton as={Link} className="no-underline" to="/budgets">
          Atur anggaran
        </SketchButton>
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-3">
      {progress.map((item) => (
        <SketchCard className="p-4" key={item.category.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="m-0 text-xl font-bold">
                {item.category.icon} {item.category.name}
              </h3>
              <p className="mt-1 mb-0 text-sm">
                {formatRupiah(item.spent)} / {formatRupiah(item.limit)}
              </p>
            </div>
            <SketchBadge variant={statusVariant[item.status]}>
              {statusLabel[item.status]}
            </SketchBadge>
          </div>
          <div className="mt-3">
            <SketchProgress label={`Anggaran ${item.category.name}`} value={item.percent} />
          </div>
          <p className="mt-2 mb-0 font-bold">
            {item.remaining >= 0
              ? `Sisa ${formatRupiah(item.remaining)}`
              : `Lebih ${formatRupiah(Math.abs(item.remaining))}`}
          </p>
        </SketchCard>
      ))}
      {compact ? (
        <SketchButton
          as={Link}
          className="justify-self-start no-underline"
          to="/budgets"
          variant="secondary"
        >
          Kelola semua anggaran
        </SketchButton>
      ) : null}
    </div>
  );
}
