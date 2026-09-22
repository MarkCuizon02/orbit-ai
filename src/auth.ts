import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  User,
  updateProfile
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

export async function loginWithEmail(email: string, pass: string, rememberMe: boolean = true) {
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  return credential.user;
}

export async function registerWithEmail(email: string, pass: string, name: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  if (credential.user) {
    await updateProfile(credential.user, { displayName: name });
    try {
      await sendEmailVerification(credential.user);
    } catch (e) {
      console.warn("Verification email notice:", e);
    }
  }
  return credential.user;
}

export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function resetUserPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function sendUserEmailVerification(user: User) {
  await sendEmailVerification(user);
}

export async function logoutUser() {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
