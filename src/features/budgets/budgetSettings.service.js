import { doc, getFirestore, onSnapshot } from 'firebase/firestore';
import { DEFAULT_BALANCE_BASE, DEFAULT_PAYDAY_DAY } from '../../shared/constants/budget.js';
import { firebaseApp } from '../../lib/firebase.js';

const db = getFirestore(firebaseApp);

function timestampToDate(value) {
  return value?.toDate ? value.toDate() : null;
}

export function subscribeToBudgetSettings(uid, onData, onError) {
  return onSnapshot(
    doc(db, 'users', uid, 'settings', 'budget'),
    (snapshot) => {
      const settings = snapshot.exists() ? snapshot.data() : {};
      onData({
        paydayDay: settings.paydayDay || DEFAULT_PAYDAY_DAY,
        balanceBase: Number.isSafeInteger(settings.balanceBase)
          ? settings.balanceBase
          : DEFAULT_BALANCE_BASE,
        balanceBaseDate: timestampToDate(settings.balanceBaseDate),
      });
    },
    onError,
  );
}
