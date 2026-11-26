import {
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { DEFAULT_CATEGORIES } from '../../shared/constants/categories.js';
import { DEFAULT_BALANCE_BASE, DEFAULT_PAYDAY_DAY } from '../../shared/constants/budget.js';
import { firebaseApp } from '../../lib/firebase.js';

const db = getFirestore(firebaseApp);

function timestampToDate(value) {
  return value?.toDate ? value.toDate() : null;
}

function mapProfile(snapshot) {
  if (!snapshot.exists()) return null;
  const profile = snapshot.data();

  return {
    ...profile,
    createdAt: timestampToDate(profile.createdAt),
    updatedAt: timestampToDate(profile.updatedAt),
  };
}

export async function getProfile(uid) {
  const profileRef = doc(db, 'users', uid);
  return mapProfile(await getDoc(profileRef));
}

export function subscribeToProfile(uid, onProfile, onError) {
  return onSnapshot(doc(db, 'users', uid), (snapshot) => onProfile(mapProfile(snapshot)), onError);
}

export async function completeOnboarding({ uid, profile }) {
  const batch = writeBatch(db);
  const userRef = doc(db, 'users', uid);
  const budgetRef = doc(db, 'users', uid, 'settings', 'budget');
  const accountRef = doc(db, 'users', uid, 'settings', 'account');
  const categoriesRef = collection(db, 'users', uid, 'categories');

  batch.set(userRef, {
    displayName: profile.displayName.trim(),
    gender: profile.gender,
    birthDate: profile.birthDate,
    email: profile.email || '',
    photoURL: profile.photoURL || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(budgetRef, {
    paydayDay: DEFAULT_PAYDAY_DAY,
    balanceBase: DEFAULT_BALANCE_BASE,
    balanceBaseDate: serverTimestamp(),
  });
  batch.set(accountRef, { plan: 'free', createdAt: serverTimestamp() });

  for (const category of DEFAULT_CATEGORIES) {
    batch.set(doc(categoriesRef, category.id), {
      name: category.name,
      icon: category.icon,
      type: category.type,
      keywords: category.keywords,
      isDefault: true,
    });
  }

  await batch.commit();
}

export async function updateProfile(uid, values) {
  const profileRef = doc(db, 'users', uid);
  await updateDoc(profileRef, {
    displayName: values.displayName.trim(),
    gender: values.gender,
    birthDate: values.birthDate,
    updatedAt: serverTimestamp(),
  });
}
