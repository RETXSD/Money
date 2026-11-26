import { collection, deleteDoc, doc, getFirestore, onSnapshot, setDoc } from 'firebase/firestore';
import { firebaseApp } from '../../lib/firebase.js';

const db = getFirestore(firebaseApp);

export function subscribeToBudgets(uid, onData, onError) {
  return onSnapshot(
    collection(db, 'users', uid, 'budgets'),
    (snapshot) => onData(snapshot.docs.map((item) => ({ categoryId: item.id, ...item.data() }))),
    onError,
  );
}

export async function saveCategoryBudget(uid, categoryId, limit) {
  await setDoc(doc(db, 'users', uid, 'budgets', categoryId), { limit });
}

export async function deleteCategoryBudget(uid, categoryId) {
  await deleteDoc(doc(db, 'users', uid, 'budgets', categoryId));
}
