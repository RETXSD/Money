import {
  collection,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { firebaseApp } from '../../lib/firebase.js';

const db = getFirestore(firebaseApp);

function timestampToDate(value) {
  return value?.toDate ? value.toDate() : null;
}

function mapDebt(snapshot) {
  const debt = snapshot.data();
  return {
    id: snapshot.id,
    ...debt,
    dueDate: timestampToDate(debt.dueDate),
    createdAt: timestampToDate(debt.createdAt),
  };
}

function mapPayment(snapshot) {
  const payment = snapshot.data();
  return { id: snapshot.id, ...payment, paidAt: timestampToDate(payment.paidAt) };
}

export function subscribeToDebts(uid, onData, onError) {
  return onSnapshot(
    query(collection(db, 'users', uid, 'debts'), orderBy('createdAt', 'desc')),
    (snapshot) => onData(snapshot.docs.map(mapDebt)),
    onError,
  );
}

export function subscribeToDebt(uid, debtId, onData, onError) {
  return onSnapshot(
    doc(db, 'users', uid, 'debts', debtId),
    (snapshot) => {
      onData(snapshot.exists() ? mapDebt(snapshot) : null);
    },
    onError,
  );
}

export function subscribeToDebtPayments(uid, debtId, onData, onError) {
  return onSnapshot(
    query(collection(db, 'users', uid, 'debts', debtId, 'payments'), orderBy('paidAt', 'desc')),
    (snapshot) => onData(snapshot.docs.map(mapPayment)),
    onError,
  );
}

export async function createDebtWithPerson(uid, values) {
  const peopleCollection = collection(db, 'users', uid, 'people');
  const personRef = values.personId
    ? doc(peopleCollection, values.personId)
    : doc(peopleCollection);
  const debtRef = doc(collection(db, 'users', uid, 'debts'));
  const batch = writeBatch(db);
  if (!values.personId) {
    batch.set(personRef, { name: values.personName.trim(), phone: values.phone?.trim() || null });
  }
  batch.set(debtRef, {
    personId: personRef.id,
    direction: values.direction,
    amount: values.amount,
    paidAmount: 0,
    dueDate: values.dueDate ? Timestamp.fromDate(values.dueDate) : null,
    note: values.note.trim(),
    status: 'open',
    affectsCash: Boolean(values.affectsCash),
    createdAt: serverTimestamp(),
  });
  if (values.affectsCash) {
    const transactionRef = doc(collection(db, 'users', uid, 'transactions'));
    batch.set(transactionRef, {
      amount: values.amount,
      type: values.direction === 'owed_to_me' ? 'expense' : 'income',
      categoryId: null,
      note: values.cashNote?.trim() || values.note.trim(),
      date: Timestamp.fromDate(values.cashDate || new Date()),
      source: values.source || 'manual',
      debtId: debtRef.id,
      fixedBillId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  await batch.commit();
  return debtRef.id;
}

export async function recordDebtPayment(uid, debt, values) {
  const debtRef = doc(db, 'users', uid, 'debts', debt.id);
  const paymentRef = doc(collection(db, 'users', uid, 'debts', debt.id, 'payments'));
  const transactionRef = doc(collection(db, 'users', uid, 'transactions'));
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(debtRef);
    if (!snapshot.exists()) throw new Error('debt-not-found');
    const current = snapshot.data();
    if (current.status !== 'open') throw new Error('debt-already-settled');
    const paidAmount = current.paidAmount + values.amount;
    if (!Number.isSafeInteger(values.amount) || values.amount <= 0 || paidAmount > current.amount) {
      throw new Error('invalid-payment-amount');
    }
    transaction.update(debtRef, {
      paidAmount,
      status: paidAmount === current.amount ? 'settled' : 'open',
    });
    transaction.set(paymentRef, {
      amount: values.amount,
      paidAt: Timestamp.fromDate(values.paidAt || new Date()),
      note: values.note?.trim() || '',
    });
    transaction.set(transactionRef, {
      amount: values.amount,
      type: current.direction === 'owed_to_me' ? 'income' : 'expense',
      categoryId: null,
      note: values.note?.trim() || 'Pembayaran utang',
      date: Timestamp.fromDate(values.paidAt || new Date()),
      source: values.source || 'manual',
      debtId: debt.id,
      fixedBillId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}
