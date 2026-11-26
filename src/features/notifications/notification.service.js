import { deleteToken, getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';
import { doc, getFirestore, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from '../../lib/firebase.js';
import {
  DEFAULT_NOTIFICATION_HOURS,
  MAX_NOTIFICATION_TOKENS,
  NOTIFICATION_SLOTS,
} from '../../shared/domain/constants.js';

const DEFAULT_TIME_ZONE = 'Asia/Jakarta';
const TOKEN_STORAGE_PREFIX = 'mtrck.notification-token.';
const db = getFirestore(firebaseApp);

function createDefaultSlots() {
  return Object.fromEntries(
    NOTIFICATION_SLOTS.map((slot) => [
      slot,
      { enabled: true, hour: DEFAULT_NOTIFICATION_HOURS[slot] },
    ]),
  );
}

export function getDefaultNotificationSettings(timezone = DEFAULT_TIME_ZONE) {
  return {
    enabled: false,
    hideAmounts: false,
    timezone,
    slots: createDefaultSlots(),
    fcmTokens: [],
  };
}

export function detectNotificationTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIME_ZONE;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

function getSubscriptionRef(uid) {
  return doc(db, 'notificationSubscriptions', uid);
}

function getTokenStorageKey(uid) {
  return `${TOKEN_STORAGE_PREFIX}${uid}`;
}

function getMessagingService() {
  return getMessaging(firebaseApp);
}

function getWorkerUrl() {
  const config = encodeURIComponent(JSON.stringify(firebaseApp.options));
  return `/firebase-messaging-sw.js?firebaseConfig=${config}`;
}

export async function registerNotificationServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  return navigator.serviceWorker.register(getWorkerUrl(), { scope: '/' });
}

export async function isPushSupported() {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    (await isSupported())
  );
}

export function getBrowserNotificationPermission() {
  return typeof window !== 'undefined' && 'Notification' in window
    ? Notification.permission
    : 'unsupported';
}

export function subscribeToNotificationSettings(uid, onSettings, onError) {
  const subscriptionRef = getSubscriptionRef(uid);
  return onSnapshot(
    subscriptionRef,
    (snapshot) => {
      const settings = snapshot.exists()
        ? {
            ...getDefaultNotificationSettings(),
            ...snapshot.data(),
            updatedAt: snapshot.data().updatedAt?.toDate?.() || null,
          }
        : getDefaultNotificationSettings();
      onSettings(settings);
    },
    onError,
  );
}

async function ensureSubscriptionSettings(uid, timezone) {
  const subscriptionRef = getSubscriptionRef(uid);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(subscriptionRef);
    if (!snapshot.exists()) {
      transaction.set(subscriptionRef, {
        ...getDefaultNotificationSettings(timezone),
        updatedAt: serverTimestamp(),
      });
      return;
    }
    if (snapshot.data().timezone !== timezone) {
      transaction.update(subscriptionRef, { timezone, updatedAt: serverTimestamp() });
    }
  });
}

export async function syncNotificationTimezone(uid, timezone = detectNotificationTimezone()) {
  await ensureSubscriptionSettings(uid, timezone);
}

export async function enableNotifications(uid) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { permission: 'unsupported' };
  }
  const permission =
    Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
  if (permission !== 'granted') return { permission };

  if (!(await isPushSupported())) return { permission: 'unsupported' };
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) throw new Error('Kunci Web Push belum diatur.');
  const registration = await registerNotificationServiceWorker();
  if (!registration) return { permission: 'unsupported' };
  const token = await getToken(getMessagingService(), {
    vapidKey,
    serviceWorkerRegistration: registration,
  });
  if (!token) throw new Error('Token perangkat belum tersedia. Coba lagi.');

  const ref = getSubscriptionRef(uid);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    const existing = snapshot.exists()
      ? { ...getDefaultNotificationSettings(), ...snapshot.data() }
      : getDefaultNotificationSettings(detectNotificationTimezone());
    const tokens = [
      ...new Set([...(existing.fcmTokens || []).filter((item) => item !== token), token]),
    ].slice(-MAX_NOTIFICATION_TOKENS);
    transaction.set(ref, {
      ...existing,
      enabled: true,
      timezone: detectNotificationTimezone(),
      fcmTokens: tokens,
      updatedAt: serverTimestamp(),
    });
  });
  window.localStorage.setItem(getTokenStorageKey(uid), token);
  return { permission, token };
}

export async function saveNotificationSettings(uid, values) {
  const ref = getSubscriptionRef(uid);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    const existing = snapshot.exists()
      ? { ...getDefaultNotificationSettings(), ...snapshot.data() }
      : getDefaultNotificationSettings(detectNotificationTimezone());
    transaction.set(ref, {
      ...existing,
      ...values,
      updatedAt: serverTimestamp(),
    });
  });
}

export async function removeNotificationToken(uid, { disableSubscription = false } = {}) {
  if (typeof window === 'undefined') return;
  const storageKey = getTokenStorageKey(uid);
  const token = window.localStorage.getItem(storageKey);
  const ref = getSubscriptionRef(uid);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) return;
    const existing = snapshot.data();
    const tokens = (existing.fcmTokens || []).filter((item) => item !== token);
    transaction.update(ref, {
      enabled: disableSubscription ? false : existing.enabled && tokens.length > 0,
      fcmTokens: tokens,
      updatedAt: serverTimestamp(),
    });
  });
  window.localStorage.removeItem(storageKey);

  if (token && (await isPushSupported()) && Notification.permission === 'granted') {
    try {
      await deleteToken(getMessagingService());
    } catch {
      // The server-side token is already removed, so a local cleanup failure is safe to ignore.
    }
  }
}

export function subscribeToForegroundMessages(onNotification) {
  return onMessage(getMessagingService(), (payload) => {
    const title = payload.data?.title || payload.notification?.title;
    const body = payload.data?.body || payload.notification?.body || '';
    if (title) onNotification({ title, body });
  });
}
