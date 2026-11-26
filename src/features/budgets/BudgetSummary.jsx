import { Link } from 'react-router-dom';
import { EmptyState } from '../../shared/components/EmptyState.jsx';
import { SketchBadge } from '../../shared/components/SketchFeedback.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { BudgetProgressList } from './BudgetProgressList.jsx';
import { BudgetWarning } from './BudgetWarning.jsx';

export function BudgetSummary({ summary, compact = false }) {
  if (summary.loading) return <p role="status">Memuat anggaran…</p>;
  if (summary.error) {
    return (
      <p className="text-red-dark m-0" role="alert">
        {summary.error}
      </p>
    );
  }

  return (
    <div className="page-grid">
      {!compact ? (
        <header>
          <SketchBadge variant="info">Siklus {summary.cycle.key}</SketchBadge>
          <h1 className="page-heading mt-3">Anggaran kategori</h1>
          <p className="page-kicker mb-0">
            Lihat pemakaian dan batas tiap pos sejak tanggal gajian.
          </p>
        </header>
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
          <SketchButton as={Link} className="no-underline" to="/budgets">
            Tambah anggaran
          </SketchButton>
        </EmptyState>
      ) : null}
    </div>
  );
}
