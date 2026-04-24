import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  onIdTokenChanged,
  browserLocalPersistence,
  setPersistence,
  type User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

setPersistence(auth, browserLocalPersistence).catch(console.warn);

const googleProvider = new GoogleAuthProvider();

export function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function registerWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function logout() {
  return signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function onTokenChange(callback: (user: User | null) => void) {
  return onIdTokenChanged(auth, callback);
}
