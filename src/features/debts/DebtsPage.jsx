import { useState } from 'react';
import { useAuth } from '../../app/providers/useAuth.js';
import { useCategories } from '../categories/hooks/useCategories.js';
import { EmptyState } from '../../shared/components/EmptyState.jsx';
import { SketchBadge } from '../../shared/components/SketchFeedback.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchTabs } from '../../shared/components/SketchTabs.jsx';
import { useDebts } from './hooks/useDebts.js';
import { usePeople } from './hooks/usePeople.js';
import { useDebtActions } from './hooks/useDebtActions.js';
import { DebtCard } from './DebtCard.jsx';
import { DebtDialogs } from './DebtDialogs.jsx';
import { buildDebtWhatsAppUrl } from './whatsapp.js';

export function DebtsPage() {
  const { user } = useAuth();
  const debts = useDebts(user.uid);
  const people = usePeople(user.uid);
  const categories = useCategories(user.uid);
  const actions = useDebtActions(user.uid);
  const [direction, setDirection] = useState('owed_to_me');
  const [debtOpen, setDebtOpen] = useState(false);
  const [splitOpen, setSplitOpen] = useState(false);
  const [splitError, setSplitError] = useState('');
  const visibleDebts = debts.data.filter((debt) => debt.direction === direction);
  const personById = new Map(people.data.map((person) => [person.id, person]));

  async function saveDebt(values) {
    const result = await actions.createDebt(values);
    if (result.success) setDebtOpen(false);
  }

  async function saveSplit(values) {
    setSplitError('');
    const result = await actions.splitBill(values);
    if (result.success) setSplitOpen(false);
    else setSplitError(actions.error);
  }

  function shareDebt(debt, person) {
    const url = buildDebtWhatsAppUrl({
      personName: person?.name || 'teman',
      phone: person?.phone,
      remaining: debt.amount - debt.paidAmount,
      dueDate: debt.dueDate,
      direction: debt.direction,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <>
      <div className="page-grid">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SketchBadge variant="info">Urusan bareng teman</SketchBadge>
            <h1 className="page-heading mt-3">Utang & piutang</h1>
            <p className="page-kicker mb-0">
              Catat janji dengan jelas dan jaga saldo tetap akurat.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SketchButton onClick={() => setDebtOpen(true)}>Tambah catatan</SketchButton>
            <SketchButton onClick={() => setSplitOpen(true)} variant="secondary">
              Bagi tagihan
            </SketchButton>
          </div>
        </header>

        <SketchTabs
          label="Jenis utang"
          onChange={setDirection}
          tabs={[
            { value: 'owed_to_me', label: 'Piutang' },
            { value: 'i_owe', label: 'Utang saya' },
          ]}
          value={direction}
        />
        {debts.loading || people.loading || categories.loading ? (
          <p role="status">Memuat catatan utang…</p>
        ) : debts.error || people.error || categories.error ? (
          <p className="text-red-dark m-0" role="alert">
            {debts.error || people.error || categories.error}
          </p>
        ) : visibleDebts.length ? (
          <div className="grid gap-3">
            {visibleDebts.map((debt) => (
              <DebtCard
                debt={debt}
                key={debt.id}
                onWhatsApp={shareDebt}
                person={personById.get(debt.personId)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            description={
              direction === 'owed_to_me'
                ? 'Saat meminjamkan uang atau menalangi teman, catat di sini.'
                : 'Catat uang yang kamu pinjam supaya rencana bayar lebih jelas.'
            }
            icon="people"
            title={direction === 'owed_to_me' ? 'Belum ada piutang' : 'Belum ada utang'}
          >
            <SketchButton onClick={() => setDebtOpen(true)}>Tambah catatan</SketchButton>
          </EmptyState>
        )}
      </div>
      <DebtDialogs
        categories={categories.data}
        debtError={actions.error}
        debtOpen={debtOpen}
        onCancelDebt={() => setDebtOpen(false)}
        onCancelSplit={() => setSplitOpen(false)}
        onSaveDebt={saveDebt}
        onSaveSplit={saveSplit}
        people={people.data}
        saving={actions.saving}
        splitError={splitError}
        splitOpen={splitOpen}
      />
    </>
  );
}
