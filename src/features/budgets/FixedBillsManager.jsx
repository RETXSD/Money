import { useState } from 'react';
import { useAuth } from '../../app/providers/useAuth.js';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { Grid, Section } from '../../shared/components/Layout.jsx';
import {
  createFixedBill,
  deleteFixedBill,
  markFixedBillPaid,
  updateFixedBill,
} from './fixedBills.service.js';
import { useFixedBills } from './hooks/useFixedBills.js';
import { getCycle } from '../../shared/utils/dates.js';
import { FixedBillCard } from './FixedBillCard.jsx';
import { FixedBillDialogs } from './FixedBillDialogs.jsx';

export function FixedBillsManager({ paydayDay }) {
  const { user } = useAuth();
  const bills = useFixedBills(user.uid);
  const [selected, setSelected] = useState(undefined);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const cycle = getCycle(new Date(), paydayDay);

  async function save(values) {
    setSaving(true);
    setError('');
    try {
      if (selected?.id) {
        await updateFixedBill(user.uid, selected.id, {
          ...values,
          paidCycleKey: selected.paidCycleKey || null,
        });
      } else {
        await createFixedBill(user.uid, { ...values, paidCycleKey: null });
      }
      setSelected(undefined);
    } catch {
      setError('Tagihan belum tersimpan. Periksa koneksi lalu coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  async function markPaid(bill) {
    setSaving(true);
    setError('');
    try {
      await markFixedBillPaid(user.uid, bill, cycle.key);
    } catch (saveError) {
      setError(
        saveError.message === 'fixed-bill-already-paid'
          ? 'Tagihan ini sudah ditandai lunas untuk siklus ini.'
          : 'Pembayaran tagihan belum tersimpan. Periksa koneksi lalu coba lagi.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!deleting) return;
    setSaving(true);
    setError('');
    try {
      await deleteFixedBill(user.uid, deleting.id);
      setDeleting(null);
    } catch {
      setError('Tagihan belum terhapus. Periksa koneksi lalu coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section gap={16}>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="showcase-title">Tagihan rutin</h2>
          <p>Tagihan aktif disisihkan dari jatah sampai jatuh tempo.</p>
        </div>
        <SketchButton
          variant="secondary"
          onClick={() => {
            setError('');
            setSelected(null);
          }}
        >
          Tambah tagihan
        </SketchButton>
      </header>

      {error && selected === undefined && !deleting ? (
        <p className="text-red-dark" role="alert">
          {error}
        </p>
      ) : null}
      {bills.loading ? (
        <p role="status">Memuat tagihan…</p>
      ) : bills.error ? (
        <p className="text-red-dark" role="alert">
          {bills.error}
        </p>
      ) : bills.data.length ? (
        <Grid className="fixed-bill-grid" gap={16}>
          {bills.data.map((bill) => (
            <FixedBillCard
              bill={bill}
              key={bill.id}
              onDelete={() => setDeleting(bill)}
              onEdit={() => {
                setError('');
                setSelected(bill);
              }}
              onMarkPaid={() => markPaid(bill)}
              paid={bill.paidCycleKey === cycle.key}
              saving={saving}
            />
          ))}
        </Grid>
      ) : (
        <SketchCard>
          <p>
            Belum ada tagihan rutin. Tambahkan kos, listrik, internet, atau cicilan.
          </p>
        </SketchCard>
      )}

      <FixedBillDialogs
        deleting={deleting}
        error={error}
        onCancelDelete={() => setDeleting(null)}
        onCancelForm={() => setSelected(undefined)}
        onDelete={remove}
        onSave={save}
        saving={saving}
        selected={selected}
      />
    </Section>
  );
}
