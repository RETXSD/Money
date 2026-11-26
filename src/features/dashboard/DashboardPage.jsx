import { useAuth } from '../../app/providers/useAuth.js';
import { useProfile } from '../auth/hooks/useProfile.js';
import { getGreeting } from '../auth/greeting.js';
import { QuickAddDock } from '../quick-add/QuickAddDock.jsx';
import { BudgetSummary } from '../budgets/BudgetSummary.jsx';
import { useBudgetSummary } from '../budgets/hooks/useBudgetSummary.js';
import { SafeToSpendCard } from '../safe-to-spend/SafeToSpendCard.jsx';
import { useSafeToSpend } from '../safe-to-spend/hooks/useSafeToSpend.js';
import { DashboardUpcoming } from './DashboardUpcoming.jsx';
import { RecentTransactions } from './RecentTransactions.jsx';
import { NotificationPromptCard } from '../notifications/components/NotificationPromptCard.jsx';
import { PageContainer, PageHeader } from '../../shared/components/Layout.jsx';

export function DashboardPage() {
  const { user } = useAuth();
  const { profile } = useProfile(user.uid);
  const budgetSummary = useBudgetSummary(user.uid);
  const safeToSpend = useSafeToSpend(user.uid);

  return (
    <>
      <PageContainer className="dashboard-layout">
        <PageHeader
          badge="Ringkasan harian"
          className="dashboard-heading"
          description="Saldo, anggaran, dan transaksi dalam satu ringkasan."
          title={getGreeting(profile, new Date())}
        />

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
            <p className="text-red-dark" role="alert">
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
      </PageContainer>
      <QuickAddDock
        budgetSummary={budgetSummary}
        categories={budgetSummary.categories}
        safeToSpend={safeToSpend}
        uid={user.uid}
      />
    </>
  );
}
