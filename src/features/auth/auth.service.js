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
import { removeNotificationToken } from '../notifications/notification.service.js';

let auth;
let authInitializationError;

try {
  auth = getAuth(firebaseApp);
} catch (error) {
  authInitializationError = error;
}

function getAuthClient() {
  if (authInitializationError) throw authInitializationError;
  return auth;
}

export function subscribeToAuth(onUser, onError) {
  try {
    return onAuthStateChanged(getAuthClient(), onUser, onError);
  } catch (error) {
    onError(error);
    return () => {};
  }
}

export async function signInWithGoogle() {
  return signInWithPopup(getAuthClient(), new GoogleAuthProvider());
}

export async function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(getAuthClient(), email.trim(), password);
}

export async function registerWithEmail(email, password, displayName) {
  const credential = await createUserWithEmailAndPassword(getAuthClient(), email.trim(), password);
  const trimmedName = displayName.trim();
  if (trimmedName) await updateAuthProfile(credential.user, { displayName: trimmedName });
  return credential;
}

export async function signOutUser() {
  const authClient = getAuthClient();
  const uid = authClient.currentUser?.uid;
  if (uid) {
    try {
      await removeNotificationToken(uid);
    } catch {
      // Logging out must still work when a notification token cannot be removed.
    }
  }
  return signOut(authClient);
}

export function getAuthErrorMessage(error) {
  const messages = {
    'auth/invalid-api-key':
      'Konfigurasi Firebase belum valid. Isi VITE_FIREBASE_* dari aplikasi web Firebase di .env, lalu mulai ulang server.',
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
