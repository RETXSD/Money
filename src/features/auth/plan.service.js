import { doc, getFirestore, onSnapshot } from 'firebase/firestore';
import { firebaseApp } from '../../lib/firebase.js';

const db = getFirestore(firebaseApp);

export function subscribeToPlan(uid, onPlan, onError) {
  return onSnapshot(
    doc(db, 'users', uid, 'settings', 'account'),
    (snapshot) => {
      const plan = snapshot.exists() ? snapshot.data().plan : 'free';
      onPlan(plan === 'pro' ? 'pro' : 'free');
    },
    onError,
  );
}
