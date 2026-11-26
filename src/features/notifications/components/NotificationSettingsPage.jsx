import { useState } from 'react';
import { SketchBadge } from '../../../shared/components/SketchFeedback.jsx';
import { SketchButton } from '../../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../../shared/components/SketchCard.jsx';
import { SketchSelect } from '../../../shared/components/SketchField.jsx';
import { NOTIFICATION_SLOTS } from '../../../shared/domain/constants.js';
import { useNotifications } from '../hooks/useNotifications.js';

const slotLabels = {
  morning: 'Pagi',
  noon: 'Siang',
  evening: 'Malam',
};
const hourOptions = Array.from({ length: 24 }, (_, hour) => ({
  value: String(hour),
  label: `${String(hour).padStart(2, '0')}:00`,
}));

function isIosSafari() {
  const agent = navigator.userAgent || '';
  const ios =
    /iPad|iPhone|iPod/.test(agent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return ios && /Safari/.test(agent) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(agent);
}

export function NotificationSettingsPage() {
  const { actionLoading, data, disable, enable, error, loading, permission, save } =
    useNotifications();
  const [draftPatch, setDraftPatch] = useState({});
  const [saved, setSaved] = useState(false);
  const draft = {
    ...data,
    ...draftPatch,
    slots: Object.fromEntries(
      NOTIFICATION_SLOTS.map((slot) => [
        slot,
        { ...data.slots?.[slot], ...draftPatch.slots?.[slot] },
      ]),
    ),
  };

  function updateSlot(slot, key, value) {
    setDraftPatch((current) => ({
      ...current,
      slots: {
        ...current.slots,
        [slot]: { ...draft.slots[slot], [key]: value },
      },
    }));
    setSaved(false);
  }

  async function savePreferences(event) {
    event.preventDefault();
    const succeeded = await save({ hideAmounts: draft.hideAmounts, slots: draft.slots });
    setSaved(succeeded);
  }

  if (loading) return <p role="status">Memuat pengaturan pengingat…</p>;
  if (error && !data)
    return (
      <p className="text-red-dark m-0" role="alert">
        {error}
      </p>
    );

  return (
    <div className="page-grid pb-24">
      <header>
        <SketchBadge variant="info">Pengingat pribadi</SketchBadge>
        <h1 className="page-heading mt-3">Notifikasi</h1>
        <p className="page-kicker">Atur waktu dan isi pengingat uang harianmu.</p>
      </header>

      <SketchCard className="grid gap-3">
        <div>
          <h2 className="showcase-title mb-1">Status pengingat</h2>
          <p className="m-0">
            {data.enabled ? 'Pengingat aktif di perangkat ini.' : 'Pengingat belum aktif.'}
          </p>
        </div>
        {data.enabled ? (
          <SketchButton disabled={actionLoading} onClick={disable} variant="danger">
            {actionLoading ? 'Mematikan…' : 'Matikan pengingat'}
          </SketchButton>
        ) : permission === 'denied' ? (
          <p className="m-0" role="note">
            Izin notifikasi ditolak. Buka pengaturan browser, izinkan notifikasi untuk MTRCK, lalu
            kembali ke halaman ini.
          </p>
        ) : (
          <SketchButton disabled={actionLoading} onClick={enable}>
            {actionLoading ? 'Mengaktifkan…' : 'Aktifkan pengingat'}
          </SketchButton>
        )}
      </SketchCard>

      <SketchCard as="form" className="grid gap-5" onSubmit={savePreferences}>
        <div>
          <h2 className="showcase-title mb-1">Jadwal harian</h2>
          <p className="m-0">Setiap pengingat menggunakan jam lokal perangkatmu.</p>
        </div>
        {NOTIFICATION_SLOTS.map((slot) => (
          <fieldset
            className="rounded-sketch-c border-ink grid gap-3 border-[2.5px] p-4"
            key={slot}
          >
            <legend className="px-2 font-bold">Pengingat {slotLabels[slot]}</legend>
            <label className="flex min-h-11 items-center gap-3 font-bold">
              <input
                checked={draft.slots?.[slot]?.enabled === true}
                className="accent-blue focus-visible:outline-blue h-5 w-5 focus-visible:outline-3 focus-visible:outline-offset-2"
                onChange={(event) => updateSlot(slot, 'enabled', event.target.checked)}
                type="checkbox"
              />
              Aktifkan slot ini
            </label>
            <SketchSelect
              label={`Jam pengingat ${slotLabels[slot].toLowerCase()}`}
              onChange={(event) => updateSlot(slot, 'hour', Number(event.target.value))}
              options={hourOptions}
              value={String(draft.slots?.[slot]?.hour ?? 7)}
            />
          </fieldset>
        ))}
        <label className="flex min-h-11 items-center gap-3 font-bold">
          <input
            checked={draft.hideAmounts === true}
            className="accent-blue focus-visible:outline-blue h-5 w-5 focus-visible:outline-3 focus-visible:outline-offset-2"
            onChange={(event) => {
              setDraftPatch((current) => ({ ...current, hideAmounts: event.target.checked }));
              setSaved(false);
            }}
            type="checkbox"
          />
          Sembunyikan nominal di notifikasi
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <SketchButton disabled={actionLoading} type="submit">
            {actionLoading ? 'Menyimpan…' : 'Simpan jadwal'}
          </SketchButton>
          {saved ? <span role="status">Pengaturan tersimpan.</span> : null}
        </div>
        {error ? (
          <p className="text-red-dark m-0" role="alert">
            {error}
          </p>
        ) : null}
      </SketchCard>

      {isIosSafari() ? (
        <SketchCard>
          <h2 className="showcase-title">Gunakan dari Layar Utama</h2>
          <p className="m-0">
            Di Safari iPhone atau iPad, tambahkan MTRCK ke Layar Utama untuk menerima pengingat web.
          </p>
        </SketchCard>
      ) : null}
    </div>
  );
}
