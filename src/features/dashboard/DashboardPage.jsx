import { Link } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth.js';
import { useProfile } from '../auth/hooks/useProfile.js';
import { getGreeting } from '../auth/greeting.js';
import { QuickAddDock } from '../quick-add/QuickAddDock.jsx';
import { BudgetSummary } from '../budgets/BudgetSummary.jsx';
import { useBudgetSummary } from '../budgets/hooks/useBudgetSummary.js';
import { SketchBadge } from '../../shared/components/SketchFeedback.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { DoodleIcon } from '../../shared/components/DoodleIcon.jsx';
import { SafeToSpendCard } from '../safe-to-spend/SafeToSpendCard.jsx';
import { useSafeToSpend } from '../safe-to-spend/hooks/useSafeToSpend.js';

export function DashboardPage() {
  const { user } = useAuth();
  const { profile } = useProfile(user.uid);
  const budgetSummary = useBudgetSummary(user.uid);
  const safeToSpend = useSafeToSpend(user.uid);

  return (
    <>
      <div className="page-grid pb-44 md:pb-40">
        <header>
          <SketchBadge variant="info">Dompet harianmu</SketchBadge>
          <h1 className="page-heading mt-3">{getGreeting(profile, new Date())}</h1>
          <p className="page-kicker">Pelan-pelan, kita bikin uangmu lebih gampang dipahami.</p>
        </header>

        <SafeToSpendCard summary={safeToSpend} />

        <BudgetSummary compact summary={budgetSummary} />

        <div className="grid gap-4 sm:grid-cols-2">
          <SketchCard>
            <h2 className="showcase-title">Mulai catat</h2>
            <p className="mt-0 mb-4">Transaksi pertamamu bikin ringkasan uang jadi berguna.</p>
            <Link className="inline-flex no-underline" to="/transactions">
              <SketchButton>Lihat catatan</SketchButton>
            </Link>
          </SketchCard>
          <SketchCard>
            <div className="flex items-center gap-2">
              <DoodleIcon className="h-6 w-6" name="chart" />
              <h2 className="showcase-title mb-0">Anggaran</h2>
            </div>
            <p className="mt-2 mb-3">Bikin batas nyaman untuk kategori yang penting.</p>
            <Link className="inline-flex no-underline" to="/budgets">
              <SketchButton variant="secondary">Lihat anggaran</SketchButton>
            </Link>
          </SketchCard>
        </div>
      </div>
      <QuickAddDock
        budgetSummary={budgetSummary}
        categories={budgetSummary.categories}
        safeToSpend={safeToSpend}
        uid={user.uid}
      />
    </>
  );
}
