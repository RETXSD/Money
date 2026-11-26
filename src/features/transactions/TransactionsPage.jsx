import { useState } from 'react';
import { useAuth } from '../../app/providers/useAuth.js';
import { DEFAULT_PAYDAY_DAY } from '../../shared/constants/budget.js';
import { EmptyState } from '../../shared/components/EmptyState.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { PageContainer, PageHeader } from '../../shared/components/Layout.jsx';
import { APP_COPY } from '../../shared/constants/copy.js';
import { formatLocalDate, getCycle } from '../../shared/utils/dates.js';
import { createTransaction, deleteTransaction, updateTransaction } from './transactions.service.js';
import { useTransactions } from './hooks/useTransactions.js';
import { useCategories } from '../categories/hooks/useCategories.js';
import { TransactionList } from './TransactionList.jsx';
import { TransactionDialogs } from './TransactionDialogs.jsx';
import { TransactionFilters } from './TransactionFilters.jsx';

function getDateRange(period, monthValue) {
  if (period === 'cycle') return getCycle(new Date(), DEFAULT_PAYDAY_DAY);
  const [year, month] = monthValue.split('-').map(Number);
  if (!year || !month) return getCycle(new Date(), DEFAULT_PAYDAY_DAY);
  return { start: new Date(year, month - 1, 1), end: new Date(year, month, 1) };
}

export function TransactionsPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('cycle');
  const [month, setMonth] = useState(formatLocalDate(new Date()).slice(0, 7));
  const [categoryId, setCategoryId] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const {
    data: categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories(user.uid);
  const range = getDateRange(period, month);
  const {
    data: transactions,
    loading,
    error: transactionsError,
  } = useTransactions(user.uid, {
    startDate: range.start,
    endDate: range.end,
    categoryId,
  });

  function openNewForm() {
    setEditing(null);
    setFormOpen(true);
  }

  async function saveTransaction(values) {
    setSaving(true);
    setError('');
    try {
      if (editing) await updateTransaction(user.uid, editing.id, values);
      else await createTransaction(user.uid, values);
      setFormOpen(false);
      setEditing(null);
    } catch {
      const message = 'Transaksi belum tersimpan. Periksa koneksi lalu coba lagi.';
      setError(message);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setSaving(true);
    setError('');
    try {
      await deleteTransaction(user.uid, deleting.id);
      setDeleting(null);
    } catch {
      setError('Transaksi belum terhapus. Periksa koneksi lalu coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        actions={<SketchButton onClick={openNewForm}>Tambah transaksi</SketchButton>}
        badge="Catatan uang"
        description="Pemasukan dan pengeluaran dalam siklus gajian."
        title={APP_COPY.pageTitles.transactions}
      />

      <TransactionFilters
        categories={categories}
        categoryId={categoryId}
        month={month}
        onCategoryChange={setCategoryId}
        onMonthChange={setMonth}
        onPeriodChange={setPeriod}
        period={period}
        range={range}
      />

      {categoriesError ? (
        <p className="text-red-dark" role="alert">
          {categoriesError}
        </p>
      ) : null}
      {error ? (
        <p className="text-red-dark" role="alert">
          {error}
        </p>
      ) : null}
      {loading || categoriesLoading ? (
        <p role="status">Memuat transaksi…</p>
      ) : transactionsError ? (
        <SketchCard role="alert">
          <p>{transactionsError}</p>
          <SketchButton onClick={() => window.location.reload()} variant="secondary">
            Coba muat ulang
          </SketchButton>
        </SketchCard>
      ) : transactions.length ? (
        <TransactionList
          categories={categories}
          onDelete={setDeleting}
          onEdit={(transaction) => {
            setEditing(transaction);
            setFormOpen(true);
          }}
          transactions={transactions}
        />
      ) : (
        <EmptyState
          description="Catat pemasukan atau pengeluaran pertamamu supaya ringkasan uang mulai terbentuk."
          title="Belum ada transaksi"
        >
          <SketchButton onClick={openNewForm} variant="secondary">
            Tambah transaksi
          </SketchButton>
        </EmptyState>
      )}

      <TransactionDialogs
        categories={categories}
        deleting={deleting}
        editing={editing}
        error={error}
        formOpen={formOpen}
        onCancelDelete={() => setDeleting(null)}
        onCloseForm={() => setFormOpen(false)}
        onConfirmDelete={confirmDelete}
        onSave={saveTransaction}
        saving={saving}
      />
    </PageContainer>
  );
}
