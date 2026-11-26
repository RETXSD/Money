import { initializeApp, getApps } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { logger } from 'firebase-functions/logger';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { buildNotification } from './domain/buildNotification.js';
import { DEFAULT_NOTIFICATION_HOURS, NOTIFICATION_SLOTS } from './domain/constants.js';
import { getZonedDateParts, loadNotificationContext } from './notificationSummary.js';

if (getApps().length === 0) initializeApp();

const db = getFirestore();
const DEFAULT_TIME_ZONE = 'Asia/Jakarta';

/** Sends at most one reminder per enabled slot and user's local calendar date. */
export const sendScheduledNotifications = onSchedule('0 * * * *', async () => {
  // TODO(scale): switch to precomputed UTC-hour indexed queries when the user count exceeds a few thousand.
  const subscriptionsSnapshot = await db
    .collection('notificationSubscriptions')
    .where('enabled', '==', true)
    .get();
  const now = new Date();

  for (const subscriptionSnapshot of subscriptionsSnapshot.docs) {
    const uid = subscriptionSnapshot.id;
    try {
      const subscription = subscriptionSnapshot.data();
      const timeZone = subscription.timezone || DEFAULT_TIME_ZONE;
      const localTime = getZonedDateParts(now, timeZone);
      const localDate = `${String(localTime.year).padStart(4, '0')}-${String(localTime.month).padStart(2, '0')}-${String(localTime.day).padStart(2, '0')}`;
      const stateRef = db.collection('notificationState').doc(uid);
      const stateSnapshot = await stateRef.get();
      const lastSent = stateSnapshot.exists() ? stateSnapshot.data().lastSent || {} : {};
      const slotsDue = NOTIFICATION_SLOTS.filter((slot) => {
        const setting = subscription.slots?.[slot];
        const hour = Number.isInteger(setting?.hour)
          ? setting.hour
          : DEFAULT_NOTIFICATION_HOURS[slot];
        return setting?.enabled === true && hour === localTime.hour && lastSent[slot] !== localDate;
      });
      let tokens = Array.isArray(subscription.fcmTokens)
        ? subscription.fcmTokens.filter((token) => typeof token === 'string' && token.length > 0)
        : [];
      if (!slotsDue.length || !tokens.length) continue;

      const context = await loadNotificationContext(db, uid, timeZone, now);
      if (!context) continue;

      for (const slot of slotsDue) {
        const notification = buildNotification({
          slot,
          profile: context.profile,
          summary: context.summary,
          today: new Date(Date.UTC(localTime.year, localTime.month - 1, localTime.day, 12)),
          hideAmounts: subscription.hideAmounts === true,
        });
        if (!notification) continue;

        const response = await getMessaging().sendEachForMulticast({
          tokens,
          data: {
            title: notification.title,
            body: notification.body,
            url: '/',
          },
        });
        const invalidTokens = new Set();
        response.responses.forEach((result, index) => {
          if (
            !result.success &&
            result.error?.code === 'messaging/registration-token-not-registered'
          ) {
            invalidTokens.add(tokens[index]);
          }
        });
        if (invalidTokens.size) {
          tokens = tokens.filter((token) => !invalidTokens.has(token));
          await subscriptionSnapshot.ref.update({
            enabled: tokens.length > 0,
            fcmTokens: tokens,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
        if (response.successCount > 0) {
          lastSent[slot] = localDate;
          await stateRef.set({ lastSent }, { merge: true });
        }
      }
    } catch (error) {
      logger.error('Scheduled notification failed for a user.', { uid, error });
    }
  }
});
