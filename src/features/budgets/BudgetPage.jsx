import { useAuth } from '../../app/providers/useAuth.js';
import { SketchBadge } from '../../shared/components/SketchFeedback.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { BudgetManager } from './BudgetManager.jsx';
import { BudgetProgressList } from './BudgetProgressList.jsx';
import { BudgetWarning } from './BudgetWarning.jsx';
import { useBudgetSummary } from './hooks/useBudgetSummary.js';
import { formatRupiah } from '../../shared/utils/money.js';

export function BudgetPage() {
  const { user } = useAuth();
  const summary = useBudgetSummary(user.uid);

  return (
    <div className="page-grid">
      <header>
        <SketchBadge variant="info">Siklus gajian {summary.cycle.key}</SketchBadge>
        <h1 className="page-heading mt-3">Anggaran</h1>
        <p className="page-kicker">
          Bagi uangmu ke kategori, lalu pantau sisanya sepanjang siklus.
        </p>
      </header>

      {summary.loading ? (
        <p role="status">Memuat anggaran…</p>
      ) : summary.error ? (
        <SketchCard role="alert">
          <p className="text-red-dark m-0">{summary.error}</p>
        </SketchCard>
      ) : (
        <>
          <BudgetWarning warning={summary.allocationWarning} />
          <SketchCard>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="mt-0 mb-1 font-bold">Dana tersedia</p>
                <p className="font-heading m-0 text-3xl">{formatRupiah(summary.balance)}</p>
              </div>
              <p className="m-0 text-sm">Saldo dasar ditambah pemasukan, dikurangi pengeluaran.</p>
            </div>
          </SketchCard>
          <section className="page-grid">
            <h2 className="showcase-title mb-0">Pemakaian siklus ini</h2>
            {summary.progress.length ? (
              <BudgetProgressList progress={summary.progress} />
            ) : (
              <p className="m-0">Belum ada batas anggaran. Tambahkan batas di bawah.</p>
            )}
          </section>
          <BudgetManager budgets={summary.budgets} categories={summary.categories} />
        </>
      )}
    </div>
  );
}
