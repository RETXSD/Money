import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as updateAuthProfile,
} from 'firebase/auth';
import { firebaseApp } from '../../lib/firebase.js';

const auth = getAuth(firebaseApp);

export function subscribeToAuth(onUser, onError) {
  return onAuthStateChanged(auth, onUser, onError);
}

export async function signInWithGoogle() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export async function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function registerWithEmail(email, password, displayName) {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const trimmedName = displayName.trim();
  if (trimmedName) await updateAuthProfile(credential.user, { displayName: trimmedName });
  return credential;
}

export async function signOutUser() {
  return signOut(auth);
}

export function getAuthErrorMessage(error) {
  const messages = {
    'auth/email-already-in-use': 'Email ini sudah terdaftar. Coba masuk.',
    'auth/invalid-credential': 'Email atau kata sandi belum sesuai.',
    'auth/invalid-email': 'Format email belum benar.',
    'auth/network-request-failed': 'Koneksi bermasalah. Periksa internet lalu coba lagi.',
    'auth/popup-closed-by-user': 'Jendela Google tertutup sebelum proses selesai.',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi beberapa saat.',
    'auth/weak-password': 'Kata sandi minimal 6 karakter.',
    'auth/user-not-found': 'Akun belum ditemukan. Coba daftar terlebih dahulu.',
    'auth/wrong-password': 'Email atau kata sandi belum sesuai.',
  };

  return messages[error?.code] || 'Belum berhasil. Coba lagi sebentar, ya.';
}
