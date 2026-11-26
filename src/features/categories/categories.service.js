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

function mapCategory(snapshot) {
  return { id: snapshot.id, ...snapshot.data() };
}

export function subscribeToCategories(uid, onData, onError) {
  const categoriesRef = collection(db, 'users', uid, 'categories');
  return onSnapshot(
    query(categoriesRef, orderBy('name', 'asc')),
    (snapshot) => onData(snapshot.docs.map(mapCategory)),
    onError,
  );
}

export async function createCategory(uid, values) {
  const categoryRef = collection(db, 'users', uid, 'categories');
  const result = await addDoc(categoryRef, {
    name: values.name.trim(),
    icon: values.icon.trim() || '✨',
    type: values.type,
    keywords: values.keywords,
    isDefault: false,
  });

  return { id: result.id, ...values, isDefault: false };
}

export async function updateCategory(uid, categoryId, values) {
  await updateDoc(doc(db, 'users', uid, 'categories', categoryId), {
    name: values.name.trim(),
    icon: values.icon.trim() || '✨',
    type: values.type,
    keywords: values.keywords,
  });
}

export async function deleteCategory(uid, categoryId) {
  await deleteDoc(doc(db, 'users', uid, 'categories', categoryId));
}
