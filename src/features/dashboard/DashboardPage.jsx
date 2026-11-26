import { useAuth } from '../../app/providers/useAuth.js';
import { useProfile } from '../auth/hooks/useProfile.js';
import { getGreeting } from '../auth/greeting.js';
import { QuickAddDock } from '../quick-add/QuickAddDock.jsx';
import { BudgetSummary } from '../budgets/BudgetSummary.jsx';
import { useBudgetSummary } from '../budgets/hooks/useBudgetSummary.js';
import { SketchBadge } from '../../shared/components/SketchFeedback.jsx';
import { SafeToSpendCard } from '../safe-to-spend/SafeToSpendCard.jsx';
import { useSafeToSpend } from '../safe-to-spend/hooks/useSafeToSpend.js';
import { DashboardUpcoming } from './DashboardUpcoming.jsx';
import { RecentTransactions } from './RecentTransactions.jsx';
import { NotificationPromptCard } from '../notifications/components/NotificationPromptCard.jsx';

export function DashboardPage() {
  const { user } = useAuth();
  const { profile } = useProfile(user.uid);
  const budgetSummary = useBudgetSummary(user.uid);
  const safeToSpend = useSafeToSpend(user.uid);

  return (
    <>
      <div className="page-grid dashboard-layout pb-44 md:pb-40">
        <header className="dashboard-heading">
          <SketchBadge variant="info">Dompet harianmu</SketchBadge>
          <h1 className="page-heading mt-3">{getGreeting(profile, new Date())}</h1>
          <p className="page-kicker">Pelan-pelan, kita bikin uangmu lebih gampang dipahami.</p>
        </header>

        <div className="dashboard-safe">
          <SafeToSpendCard summary={safeToSpend} />
        </div>

        <div className="dashboard-budget">
          <BudgetSummary compact summary={budgetSummary} />
        </div>

        <div className="dashboard-upcoming">
          <DashboardUpcoming summary={safeToSpend} />
        </div>
        <div className="dashboard-recent">
          {budgetSummary.loading ? (
            <p role="status">Memuat transaksi terbaru…</p>
          ) : budgetSummary.error ? (
            <p className="text-red-dark m-0" role="alert">
              {budgetSummary.error}
            </p>
          ) : (
            <RecentTransactions
              categories={budgetSummary.categories}
              transactions={budgetSummary.transactions}
            />
          )}
        </div>
        <div className="dashboard-notification">
          <NotificationPromptCard />
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
