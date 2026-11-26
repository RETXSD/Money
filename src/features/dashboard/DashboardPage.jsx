import { Link } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth.js';
import { useProfile } from '../auth/hooks/useProfile.js';
import { getGreeting } from '../auth/greeting.js';
import { QuickAddDock } from '../quick-add/QuickAddDock.jsx';
import { SketchBadge } from '../../shared/components/SketchFeedback.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { DoodleIcon } from '../../shared/components/DoodleIcon.jsx';

export function DashboardPage() {
  const { user } = useAuth();
  const { profile } = useProfile(user.uid);

  return (
    <>
      <div className="page-grid pb-44 md:pb-40">
        <header>
          <SketchBadge variant="info">Dompet harianmu</SketchBadge>
          <h1 className="page-heading mt-3">{getGreeting(profile, new Date())}</h1>
          <p className="page-kicker">Pelan-pelan, kita bikin uangmu lebih gampang dipahami.</p>
        </header>

        <SketchCard className="sketch-success" sticky>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mt-0 mb-1 font-bold">Jatah hari ini</p>
              <p className="font-heading m-0 text-4xl leading-tight">Mulai dari saldo</p>
              <p className="mt-2 mb-0 text-sm">
                Atur siklus gajian untuk menghitung jatah harianmu.
              </p>
            </div>
            <DoodleIcon className="mt-1 h-9 w-9 shrink-0" name="wallet" />
          </div>
          <Link className="mt-4 inline-flex no-underline" to="/settings">
            <SketchButton variant="secondary">Atur dompet</SketchButton>
          </Link>
        </SketchCard>

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
      <QuickAddDock />
    </>
  );
}
