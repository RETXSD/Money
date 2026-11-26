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
import { Grid, PageContainer, PageHeader, Section } from '../../shared/components/Layout.jsx';
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

  if (record.loading || people.loading)
    return (
      <PageContainer>
        <PageHeader badge="Utang" description="Rincian saldo dan pembayaran." title="Rincian utang" />
        <p role="status">Memuat rincian utang…</p>
      </PageContainer>
    );
  if (record.error || people.error) {
    return (
      <PageContainer>
        <PageHeader badge="Utang" description="Rincian saldo dan pembayaran." title="Rincian utang" />
        <SketchCard role="alert" className="text-red-dark">
          {record.error || people.error}
        </SketchCard>
      </PageContainer>
    );
  }
  if (!record.debt) {
    return (
      <PageContainer>
        <PageHeader
          badge="Utang"
          description="Rincian saldo dan pembayaran."
          title="Catatan tidak ditemukan"
        />
        <SketchButton as={Link} className="no-underline" to="/debts" variant="secondary">
          Kembali
        </SketchButton>
      </PageContainer>
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
    <PageContainer>
      <PageHeader
        actions={
          <SketchButton as={Link} className="no-underline" to="/debts" variant="secondary">
            Kembali
          </SketchButton>
        }
        badge={debt.direction === 'owed_to_me' ? 'Piutang' : 'Utang saya'}
        badgeVariant={debt.direction === 'owed_to_me' ? 'success' : 'danger'}
        description="Rincian saldo dan pembayaran."
        title={person?.name || 'Orang tidak ditemukan'}
      />

      <SketchCard>
        <Grid className="sm:grid-cols-2" gap={16}>
          <div>
            <p>Jumlah awal</p>
            <strong className="text-2xl">{formatRupiah(debt.amount)}</strong>
          </div>
          <div>
            <p>Sudah dibayar</p>
            <strong className="text-2xl">{formatRupiah(debt.paidAmount)}</strong>
          </div>
          <div>
            <p>Sisa</p>
            <strong className="text-2xl">{formatRupiah(remaining)}</strong>
          </div>
          <div>
            <p>Jatuh tempo</p>
            <strong>{formatDate(debt.dueDate)}</strong>
          </div>
        </Grid>
        {debt.note ? <p>{debt.note}</p> : null}
        <SketchButton
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

      <Section gap={16}>
        <h2 className="showcase-title">Riwayat pembayaran</h2>
        {record.error ? (
          <p className="text-red-dark" role="alert">
            {record.error}
          </p>
        ) : null}
        <PaymentHistory payments={record.payments} />
      </Section>
    </PageContainer>
  );
}
