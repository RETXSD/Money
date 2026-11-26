import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth.js';
import { usePeople } from './hooks/usePeople.js';
import { useDebt } from './hooks/useDebt.js';
import { useDebtActions } from './hooks/useDebtActions.js';
import { PaymentForm } from './PaymentForm.jsx';
import { PaymentHistory } from './PaymentHistory.jsx';
import { SketchBadge } from '../../shared/components/SketchFeedback.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { formatRupiah } from '../../shared/utils/money.js';
import { buildDebtWhatsAppUrl } from './whatsapp.js';

function formatDate(date) {
  return date
    ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(
        date,
      )
    : 'Belum ditentukan';
}

export function DebtDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const record = useDebt(user.uid, id);
  const people = usePeople(user.uid);
  const actions = useDebtActions(user.uid);

  async function savePayment(values) {
    const result = await actions.recordPayment(record.debt, { ...values, paidAt: new Date() });
    return result.success;
  }

  if (record.loading || people.loading) return <p role="status">Memuat rincian utang…</p>;
  if (record.error || people.error) {
    return (
      <p className="text-red-dark m-0" role="alert">
        {record.error || people.error}
      </p>
    );
  }
  if (!record.debt) {
    return (
      <SketchCard>
        <h1 className="showcase-title">Catatan utang tidak ditemukan</h1>
        <SketchButton as={Link} className="no-underline" to="/debts" variant="secondary">
          Kembali
        </SketchButton>
      </SketchCard>
    );
  }

  const debt = record.debt;
  const person = people.data.find((item) => item.id === debt.personId);
  const remaining = debt.amount - debt.paidAmount;
  const shareUrl = buildDebtWhatsAppUrl({
    personName: person?.name || 'teman',
    phone: person?.phone,
    remaining,
    dueDate: debt.dueDate,
    direction: debt.direction,
  });

  return (
    <div className="page-grid">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <SketchBadge variant={debt.direction === 'owed_to_me' ? 'success' : 'danger'}>
            {debt.direction === 'owed_to_me' ? 'Piutang' : 'Utang saya'}
          </SketchBadge>
          <h1 className="page-heading mt-3">{person?.name || 'Orang tidak ditemukan'}</h1>
        </div>
        <SketchButton as={Link} className="no-underline" to="/debts" variant="secondary">
          Kembali
        </SketchButton>
      </header>

      <SketchCard>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="m-0">Jumlah awal</p>
            <strong className="text-2xl">{formatRupiah(debt.amount)}</strong>
          </div>
          <div>
            <p className="m-0">Sudah dibayar</p>
            <strong className="text-2xl">{formatRupiah(debt.paidAmount)}</strong>
          </div>
          <div>
            <p className="m-0">Sisa</p>
            <strong className="text-2xl">{formatRupiah(remaining)}</strong>
          </div>
          <div>
            <p className="m-0">Jatuh tempo</p>
            <strong>{formatDate(debt.dueDate)}</strong>
          </div>
        </div>
        {debt.note ? <p className="mt-4 mb-0">{debt.note}</p> : null}
        <SketchButton
          className="mt-4"
          onClick={() => window.open(shareUrl, '_blank', 'noopener,noreferrer')}
          variant="secondary"
        >
          Bagikan pengingat WhatsApp
        </SketchButton>
      </SketchCard>

      {debt.status === 'open' ? (
        <SketchCard>
          <h2 className="showcase-title">Catat pembayaran</h2>
          <PaymentForm
            error={actions.error}
            onSave={savePayment}
            remaining={remaining}
            saving={actions.saving}
          />
        </SketchCard>
      ) : (
        <SketchBadge variant="success">Utang ini sudah lunas</SketchBadge>
      )}

      <section className="page-grid">
        <h2 className="showcase-title mb-0">Riwayat pembayaran</h2>
        {record.error ? (
          <p className="text-red-dark m-0" role="alert">
            {record.error}
          </p>
        ) : null}
        <PaymentHistory payments={record.payments} />
      </section>
    </div>
  );
}
