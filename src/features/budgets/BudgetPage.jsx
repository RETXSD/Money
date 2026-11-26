import { useAuth } from '../../app/providers/useAuth.js';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { PageContainer, PageHeader, Section, Stack } from '../../shared/components/Layout.jsx';
import { APP_COPY } from '../../shared/constants/copy.js';
import { BudgetManager } from './BudgetManager.jsx';
import { BudgetProgressList } from './BudgetProgressList.jsx';
import { BudgetWarning } from './BudgetWarning.jsx';
import { useBudgetSummary } from './hooks/useBudgetSummary.js';
import { formatRupiah } from '../../shared/utils/money.js';

export function BudgetPage() {
  const { user } = useAuth();
  const summary = useBudgetSummary(user.uid);

  return (
    <PageContainer>
      <PageHeader
        badge="Siklus gajian"
        description="Atur batas dan pantau sisa setiap kategori."
        title={APP_COPY.pageTitles.budgets}
      />

      {summary.loading ? (
        <p role="status">Memuat anggaran…</p>
      ) : summary.error ? (
        <SketchCard role="alert">
          <p className="text-red-dark">{summary.error}</p>
        </SketchCard>
      ) : (
        <>
          <BudgetWarning warning={summary.allocationWarning} />
          <SketchCard>
            <Stack gap={8}>
              <p className="font-bold">Dana tersedia</p>
              <p className="safe-amount font-heading">{formatRupiah(summary.balance)}</p>
              <p className="text-sm">Saldo dasar dan transaksi pada siklus ini.</p>
            </Stack>
          </SketchCard>
          <Section gap={16}>
            <h2 className="showcase-title">Pemakaian siklus ini</h2>
            {summary.progress.length ? (
              <BudgetProgressList progress={summary.progress} />
            ) : (
              <p>Belum ada batas anggaran. Tambahkan batas di bawah.</p>
            )}
          </Section>
          <BudgetManager budgets={summary.budgets} categories={summary.categories} />
        </>
      )}
    </PageContainer>
  );
}
