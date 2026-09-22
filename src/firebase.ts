/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import firebaseConfigJson from "../firebase-applet-config.json";

export const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey || (import.meta as any).env?.VITE_FIREBASE_API_KEY,
  authDomain: firebaseConfigJson.authDomain || (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: firebaseConfigJson.projectId || (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID,
  storageBucket: firebaseConfigJson.storageBucket || (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: firebaseConfigJson.messagingSenderId || (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: firebaseConfigJson.appId || (import.meta as any).env?.VITE_FIREBASE_APP_ID,
  measurementId: firebaseConfigJson.measurementId || (import.meta as any).env?.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with custom databaseId if specified
const databaseId = firebaseConfigJson.firestoreDatabaseId;
export const db = (databaseId && databaseId !== "(default)")
  ? getFirestore(app, databaseId)
  : getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Initialize Functions
export const functions = getFunctions(app);

// Analytics (browser only)
export const analyticsPromise = typeof window !== "undefined"
  ? isAnalyticsSupported().then((supported) => (supported ? getAnalytics(app) : null)).catch(() => null)
  : Promise.resolve(null);
