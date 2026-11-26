import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { firebaseApp } from '../../lib/firebase.js';

const db = getFirestore(firebaseApp);

function timestampToDate(value) {
  return value?.toDate ? value.toDate() : null;
}

function mapTransaction(snapshot) {
  const transaction = snapshot.data();
  return {
    id: snapshot.id,
    ...transaction,
    date: timestampToDate(transaction.date),
    createdAt: timestampToDate(transaction.createdAt),
    updatedAt: timestampToDate(transaction.updatedAt),
  };
}

function transactionPayload(values) {
  return {
    amount: values.amount,
    type: values.type,
    categoryId: values.categoryId || null,
    note: values.note.trim(),
    date: Timestamp.fromDate(values.date),
    source: values.source || 'manual',
    debtId: values.debtId || null,
    fixedBillId: values.fixedBillId || null,
    updatedAt: serverTimestamp(),
  };
}

export function subscribeToTransactions(uid, filter, onData, onError) {
  const transactionsRef = collection(db, 'users', uid, 'transactions');
  const constraints = [
    where('date', '>=', Timestamp.fromDate(filter.startDate)),
    where('date', '<', Timestamp.fromDate(filter.endDate)),
  ];
  if (filter.categoryId) constraints.push(where('categoryId', '==', filter.categoryId));
  constraints.push(orderBy('date', 'desc'));

  return onSnapshot(
    query(transactionsRef, ...constraints),
    (snapshot) => onData(snapshot.docs.map(mapTransaction)),
    onError,
  );
}

export async function createTransaction(uid, values) {
  const transactionsRef = collection(db, 'users', uid, 'transactions');
  const payload = transactionPayload(values);
  const result = await addDoc(transactionsRef, {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return {
    id: result.id,
    ...values,
    categoryId: values.categoryId || null,
    source: values.source || 'manual',
    debtId: values.debtId || null,
  };
}

export async function updateTransaction(uid, transactionId, values) {
  const transactionRef = doc(db, 'users', uid, 'transactions', transactionId);
  await updateDoc(transactionRef, transactionPayload(values));
}

export async function deleteTransaction(uid, transactionId) {
  await deleteDoc(doc(db, 'users', uid, 'transactions', transactionId));
}
