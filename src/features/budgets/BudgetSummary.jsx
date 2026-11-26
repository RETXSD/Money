import { Link } from 'react-router-dom';
import { EmptyState } from '../../shared/components/EmptyState.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { PageHeader, Section } from '../../shared/components/Layout.jsx';
import { APP_COPY } from '../../shared/constants/copy.js';
import { BudgetProgressList } from './BudgetProgressList.jsx';
import { BudgetWarning } from './BudgetWarning.jsx';

export function BudgetSummary({ summary, compact = false }) {
  if (summary.loading) return <p role="status">Memuat anggaran…</p>;
  if (summary.error) {
    return (
      <p className="text-red-dark" role="alert">
        {summary.error}
      </p>
    );
  }

  return (
    <Section gap={16}>
      {!compact ? (
        <PageHeader
          badge="Siklus gajian"
          description="Pemakaian dan batas tiap kategori pada siklus ini."
          title={APP_COPY.pageTitles.budgets}
        />
      ) : null}
      <BudgetWarning warning={summary.allocationWarning} />
      {summary.progress.length ? (
        <BudgetProgressList compact={compact} progress={summary.progress} />
      ) : compact ? (
        <EmptyState
          description="Bagi uangmu per kategori agar pengeluaran lebih terarah."
          icon="chart"
          title="Atur anggaran pertamamu"
        >
          <SketchButton as={Link} className="no-underline" to="/budgets" variant="secondary">
            Tambah anggaran
          </SketchButton>
        </EmptyState>
      ) : null}
    </Section>
  );
}
