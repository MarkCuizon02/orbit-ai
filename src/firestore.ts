import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
import { db } from "./firebase";
import { UserOrbitProfile, Task, ScheduleEvent, Habit, BillItem, NoteItem, GoalItem, WorkoutLog, MealPlanItem } from "./types";

export interface OnboardingData {
  name: string;
  role: string;
  goals: string[];
  sleepSchedule: string;
  workingHours: string;
  preferredProductivityTime: string;
  planningStyle: string;
}

// User Profile & Onboarding
export async function saveUserProfile(userId: string, profileData: Partial<UserOrbitProfile> | OnboardingData) {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, {
    ...profileData,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

export async function getUserProfile(userId: string): Promise<UserOrbitProfile | null> {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data() as UserOrbitProfile;
  }
  return null;
}

// Collection real-time subscriptions
export function subscribeUserCollection<T>(
  collectionName: string,
  userId: string,
  callback: (items: T[]) => void
) {
  const q = query(collection(db, collectionName), where("userId", "==", userId));
  return onSnapshot(q, (snapshot) => {
    const items: T[] = [];
    snapshot.forEach((d) => {
      items.push({ id: d.id, ...d.data() } as unknown as T);
    });
    callback(items);
  }, (err) => {
    console.warn(`Firestore subscription error for ${collectionName}:`, err);
  });
}

// Generic Document Operations
export async function createDocument<T extends object>(collectionName: string, userId: string, data: T) {
  const colRef = collection(db, collectionName);
  const res = await addDoc(colRef, {
    ...data,
    userId,
    createdAt: new Date().toISOString()
  });
  return res.id;
}

export async function updateDocument<T extends object>(collectionName: string, docId: string, data: Partial<T>) {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteDocument(collectionName: string, docId: string) {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
}
