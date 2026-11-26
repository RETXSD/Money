import { useEffect, useState } from 'react';
import { useAuth } from '../../../app/providers/useAuth.js';
import { NotificationContext } from '../hooks/NotificationContext.js';
import {
  detectNotificationTimezone,
  enableNotifications,
  getBrowserNotificationPermission,
  getDefaultNotificationSettings,
  isPushSupported,
  registerNotificationServiceWorker,
  removeNotificationToken,
  saveNotificationSettings,
  subscribeToForegroundMessages,
  subscribeToNotificationSettings,
  syncNotificationTimezone,
} from '../notification.service.js';

function getUserError() {
  return 'Pengingat belum dapat diperbarui. Periksa koneksi lalu coba lagi.';
}

function useNotificationState(uid) {
  const [state, setState] = useState({
    data: getDefaultNotificationSettings(),
    loading: Boolean(uid),
    error: '',
    permission: getBrowserNotificationPermission(),
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!uid) {
      setState({
        data: getDefaultNotificationSettings(),
        loading: false,
        error: '',
        permission: getBrowserNotificationPermission(),
      });
      return undefined;
    }

    let active = true;
    setState((current) => ({ ...current, loading: true, error: '' }));
    const unsubscribe = subscribeToNotificationSettings(
      uid,
      (data) => {
        if (active) setState((current) => ({ ...current, data, loading: false, error: '' }));
      },
      () => {
        if (active) setState((current) => ({ ...current, loading: false, error: getUserError() }));
      },
    );
    void syncNotificationTimezone(uid, detectNotificationTimezone()).catch(() => {
      if (active) setState((current) => ({ ...current, error: getUserError() }));
    });
    void registerNotificationServiceWorker().catch(() => {});

    return () => {
      active = false;
      unsubscribe();
    };
  }, [uid]);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    if (uid && state.data.enabled && state.permission === 'granted') {
      void isPushSupported().then((supported) => {
        if (!active || !supported) return;
        unsubscribe = subscribeToForegroundMessages(({ title, body }) => {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/icons/mtrck-192.svg' });
          }
        });
      });
    }
    return () => {
      active = false;
      unsubscribe();
    };
  }, [uid, state.data.enabled, state.permission]);

  async function enable() {
    if (!uid) return { permission: 'unsupported' };
    setActionLoading(true);
    setState((current) => ({ ...current, error: '' }));
    try {
      const result = await enableNotifications(uid);
      setState((current) => ({ ...current, permission: result.permission }));
      if (result.permission === 'unsupported') {
        setState((current) => ({
          ...current,
          error: 'Browser ini belum mendukung pengingat web.',
        }));
      }
      return result;
    } catch (error) {
      setState((current) => ({
        ...current,
        permission: getBrowserNotificationPermission(),
        error:
          error.message === 'Kunci Web Push belum diatur.'
            ? 'Kunci Web Push belum diatur di konfigurasi aplikasi.'
            : getUserError(),
      }));
      return { permission: getBrowserNotificationPermission(), error };
    } finally {
      setActionLoading(false);
    }
  }

  async function disable() {
    if (!uid) return;
    setActionLoading(true);
    setState((current) => ({ ...current, error: '' }));
    try {
      await removeNotificationToken(uid, { disableSubscription: true });
    } catch {
      setState((current) => ({ ...current, error: getUserError() }));
    } finally {
      setActionLoading(false);
    }
  }

  async function save(values) {
    if (!uid) return;
    setActionLoading(true);
    setState((current) => ({ ...current, error: '' }));
    try {
      await saveNotificationSettings(uid, values);
      return true;
    } catch {
      setState((current) => ({ ...current, error: getUserError() }));
      return false;
    } finally {
      setActionLoading(false);
    }
  }

  return {
    uid,
    ...state,
    actionLoading,
    enable,
    disable,
    save,
  };
}

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const value = useNotificationState(user?.uid);
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
