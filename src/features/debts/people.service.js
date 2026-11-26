import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { firebaseApp } from '../../lib/firebase.js';

const db = getFirestore(firebaseApp);

export function subscribeToPeople(uid, onData, onError) {
  return onSnapshot(
    query(collection(db, 'users', uid, 'people'), orderBy('name', 'asc')),
    (snapshot) => onData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
}

export async function createPerson(uid, values) {
  const result = await addDoc(collection(db, 'users', uid, 'people'), {
    name: values.name.trim(),
    phone: values.phone?.trim() || null,
  });
  return { id: result.id, name: values.name.trim(), phone: values.phone?.trim() || null };
}

export async function updatePerson(uid, personId, values) {
  await updateDoc(doc(db, 'users', uid, 'people', personId), {
    name: values.name.trim(),
    phone: values.phone?.trim() || null,
  });
}

export async function deletePerson(uid, personId) {
  await deleteDoc(doc(db, 'users', uid, 'people', personId));
}
