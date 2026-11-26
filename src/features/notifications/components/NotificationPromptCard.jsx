import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SketchButton } from '../../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../../shared/components/SketchCard.jsx';
import { useNotifications } from '../hooks/useNotifications.js';

function isIosSafari() {
  const agent = navigator.userAgent || '';
  const ios =
    /iPad|iPhone|iPod/.test(agent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const safari = /Safari/.test(agent) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(agent);
  return ios && safari;
}

function isStandalone() {
  return navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
}

export function NotificationPromptCard() {
  const { actionLoading, data, enable, error, loading, permission, uid } = useNotifications();
  const [dismissedUser, setDismissedUser] = useState(null);
  const showIosHint = isIosSafari() && !isStandalone();
  const dismissed =
    dismissedUser?.uid === uid
      ? dismissedUser.value
      : window.localStorage.getItem(`mtrck.notification-prompt-dismissed.${uid}`) === 'true';
  const showPermissionHelp = permission === 'denied' && !dismissed;

  if (
    loading ||
    (data.enabled && !showIosHint && !showPermissionHelp) ||
    (!showIosHint && !showPermissionHelp && dismissed)
  )
    return null;

  async function turnOn() {
    await enable();
  }

  function dismiss() {
    window.localStorage.setItem(`mtrck.notification-prompt-dismissed.${uid}`, 'true');
    setDismissedUser({ uid, value: true });
  }

  return (
    <SketchCard>
      {showIosHint ? (
        <p role="note">
          Di Safari iPhone atau iPad, tambahkan MTRCK ke Layar Utama agar pengingat web dapat
          diterima.
        </p>
      ) : null}
      {(!data.enabled && !dismissed) || showPermissionHelp ? (
        <>
          <div>
            <h2 className="showcase-title">Aktifkan pengingat harian?</h2>
            {showPermissionHelp ? (
              <p>
                Notifikasi MTRCK diblokir browser. Izinkan notifikasi di pengaturan browser untuk
                mengaktifkannya
                lagi.
              </p>
            ) : (
              <p>
                Pilih pengingat pagi, siang, dan malam supaya catatan uangmu tetap terjaga.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {permission !== 'denied' ? (
              <SketchButton disabled={actionLoading} onClick={turnOn} variant="secondary">
                {actionLoading ? 'Mengaktifkan…' : 'Aktifkan'}
              </SketchButton>
            ) : null}
            <SketchButton
              as={Link}
              className="no-underline"
              to="/settings/notifications"
              variant="secondary"
            >
              Pengaturan
            </SketchButton>
            <SketchButton onClick={dismiss} variant="secondary">
              Nanti
            </SketchButton>
          </div>
          {error ? (
            <p className="text-red-dark" role="alert">
              {error}
            </p>
          ) : null}
        </>
      ) : null}
    </SketchCard>
  );
}
