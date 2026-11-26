import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { firebaseApp } from '../../lib/firebase.js';

const db = getFirestore(firebaseApp);

export function subscribeToFixedBills(uid, onData, onError) {
  return onSnapshot(
    collection(db, 'users', uid, 'fixedBills'),
    (snapshot) => onData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
}

function fixedBillPayload(values) {
  return {
    name: values.name.trim(),
    amount: values.amount,
    dueDay: values.dueDay,
    active: values.active,
    paidCycleKey: values.paidCycleKey || null,
  };
}

export async function createFixedBill(uid, values) {
  const result = await addDoc(collection(db, 'users', uid, 'fixedBills'), fixedBillPayload(values));
  return { id: result.id, ...values };
}

export async function updateFixedBill(uid, billId, values) {
  await updateDoc(doc(db, 'users', uid, 'fixedBills', billId), fixedBillPayload(values));
}

export async function deleteFixedBill(uid, billId) {
  await deleteDoc(doc(db, 'users', uid, 'fixedBills', billId));
}

export async function markFixedBillPaid(uid, bill, cycleKey, paidAt = new Date()) {
  const billRef = doc(db, 'users', uid, 'fixedBills', bill.id);
  const transactionRef = doc(collection(db, 'users', uid, 'transactions'));
  await runTransaction(db, async (transaction) => {
    const currentBill = await transaction.get(billRef);
    if (!currentBill.exists() || !currentBill.data().active) {
      throw new Error('fixed-bill-unavailable');
    }
    if (currentBill.data().paidCycleKey === cycleKey) {
      throw new Error('fixed-bill-already-paid');
    }
    const values = currentBill.data();
    transaction.update(billRef, { paidCycleKey: cycleKey });
    transaction.set(transactionRef, {
      amount: values.amount,
      type: 'expense',
      categoryId: null,
      note: `Tagihan ${values.name}`,
      date: Timestamp.fromDate(paidAt),
      source: 'manual',
      debtId: null,
      fixedBillId: bill.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}
