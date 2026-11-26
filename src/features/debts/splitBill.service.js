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

export async function createSplitBill(uid, { total, categoryId, shares, date = new Date() }) {
  const distributedTotal = shares.reduce((sum, participant) => sum + participant.share, 0);
  if (
    !Number.isSafeInteger(total) ||
    total <= 0 ||
    distributedTotal !== total ||
    shares.filter((participant) => participant.isMe).length !== 1 ||
    !categoryId
  ) {
    throw new RangeError('Periksa total, bagian saya, dan kategori sebelum menyimpan patungan.');
  }
  const batch = writeBatch(db);
  const transactionCollection = collection(db, 'users', uid, 'transactions');
  const debtCollection = collection(db, 'users', uid, 'debts');
  const createdAt = serverTimestamp();

  for (const participant of shares) {
    if (!Number.isSafeInteger(participant.share) || participant.share < 0) {
      throw new RangeError('Bagian patungan harus berupa rupiah bulat.');
    }
    if (participant.share === 0) continue;

    if (participant.isMe) {
      batch.set(doc(transactionCollection), {
        amount: participant.share,
        type: 'expense',
        categoryId,
        note: 'Bagian saya dari patungan',
        date: Timestamp.fromDate(date),
        source: 'manual',
        debtId: null,
        fixedBillId: null,
        createdAt,
        updatedAt: createdAt,
      });
      continue;
    }

    const debtRef = doc(debtCollection);
    if (!participant.personId)
      throw new RangeError('Peserta patungan harus memiliki profil orang.');
    batch.set(debtRef, {
      personId: participant.personId,
      direction: 'owed_to_me',
      amount: participant.share,
      paidAmount: 0,
      dueDate: null,
      note: 'Patungan',
      status: 'open',
      affectsCash: true,
      createdAt,
    });
    batch.set(doc(transactionCollection), {
      amount: participant.share,
      type: 'expense',
      categoryId: null,
      note: `Talangin ${participant.name}`,
      date: Timestamp.fromDate(date),
      source: 'manual',
      debtId: debtRef.id,
      fixedBillId: null,
      createdAt,
      updatedAt: createdAt,
    });
  }

  await batch.commit();
}
