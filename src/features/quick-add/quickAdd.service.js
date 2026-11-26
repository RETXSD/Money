import {
  collection,
  doc,
  getFirestore,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { firebaseApp } from '../../lib/firebase.js';

const db = getFirestore(firebaseApp);

export async function saveQuickAddTransaction(uid, values, learnedKeyword) {
  const transactionsRef = collection(db, 'users', uid, 'transactions');
  const transactionRef = doc(transactionsRef);
  const batch = writeBatch(db);
  batch.set(transactionRef, {
    amount: values.amount,
    type: values.type,
    categoryId: values.categoryId || null,
    note: values.note.trim(),
    date: Timestamp.fromDate(values.date),
    source: 'quick-add',
    debtId: null,
    fixedBillId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (learnedKeyword?.categoryId && learnedKeyword.keyword) {
    const categoryRef = doc(db, 'users', uid, 'categories', learnedKeyword.categoryId);
    batch.update(categoryRef, { keywords: learnedKeyword.keywords });
  }

  await batch.commit();
  return {
    id: transactionRef.id,
    ...values,
    source: 'quick-add',
    debtId: null,
    fixedBillId: null,
  };
}
