import { Link } from 'react-router-dom';
import { SketchBadge } from '../../shared/components/SketchFeedback.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { useAuth } from '../../app/providers/useAuth.js';
import { useBudgetSettings } from '../budgets/hooks/useBudgetSettings.js';
import { BudgetSettingsForm } from '../budgets/BudgetSettingsForm.jsx';
import { FixedBillsManager } from '../budgets/FixedBillsManager.jsx';
import { saveBudgetSettings } from '../budgets/budgetSettings.service.js';
import { useState } from 'react';

export function SettingsPage() {
  const { user } = useAuth();
  const settings = useBudgetSettings(user.uid);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  async function save(values) {
    setSaving(true);
    setSaveError('');
    try {
      await saveBudgetSettings(user.uid, {
        ...values,
        balanceBaseDate:
          values.resetBalance || values.balanceBase !== settings.data.balanceBase
            ? new Date()
            : settings.data.balanceBaseDate || new Date(),
      });
    } catch {
      setSaveError('Pengaturan dompet belum tersimpan. Periksa koneksi lalu coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-grid">
      <header>
        <SketchBadge variant="info">Preferensi</SketchBadge>
        <h1 className="page-heading mt-3">Pengaturan</h1>
        <p className="page-kicker">Sesuaikan cara MTRCK mengatur dompetmu.</p>
      </header>
      <div className="settings-shortcuts">
        <SketchCard>
          <h2 className="showcase-title">Kategori</h2>
          <p className="mt-0">Atur kategori pemasukan dan pengeluaran yang kamu pakai.</p>
          <SketchButton as={Link} className="no-underline" to="/settings/categories">
            Kelola kategori
          </SketchButton>
        </SketchCard>
        <SketchCard>
          <h2 className="showcase-title">Pengingat harian</h2>
          <p className="mt-0">Atur waktu pengingat dan pilih apakah nominal ditampilkan.</p>
          <SketchButton
            as={Link}
            className="no-underline"
            to="/settings/notifications"
            variant="secondary"
          >
            Atur notifikasi
          </SketchButton>
        </SketchCard>
      </div>
      <SketchCard>
        <h2 className="showcase-title">Siklus gajian</h2>
        {settings.loading ? (
          <p role="status">Memuat pengaturan…</p>
        ) : settings.error ? (
          <p className="text-red-dark m-0" role="alert">
            {settings.error}
          </p>
        ) : settings.data ? (
          <BudgetSettingsForm
            error={saveError}
            onSave={save}
            saving={saving}
            settings={settings.data}
          />
        ) : null}
      </SketchCard>
      {settings.data ? <FixedBillsManager paydayDay={settings.data.paydayDay} /> : null}
    </div>
  );
}
