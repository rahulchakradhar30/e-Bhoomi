import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { OfficerProfile } from '../../types/officer';

const OFFICERS_COLLECTION = 'officers';

export async function getAllOfficers(): Promise<OfficerProfile[]> {
  const ref = collection(db, OFFICERS_COLLECTION);
  const snap = await getDocs(ref);
  return snap.docs.map(doc => doc.data() as OfficerProfile);
}

export async function getOfficerProfile(officerId: string): Promise<OfficerProfile | null> {
  const ref = doc(db, OFFICERS_COLLECTION, officerId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as OfficerProfile;
  }
  return null;
}

export async function getOfficerByAuthUid(authUid: string): Promise<OfficerProfile | null> {
  // Officers are stored with their Firebase Auth UID as the Firestore document ID.
  // Direct document get satisfies the rule uid()==officerId without custom claims.
  const ref = doc(db, OFFICERS_COLLECTION, authUid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as OfficerProfile;
  }
  return null;
}

export async function createOfficerProfile(profile: OfficerProfile): Promise<void> {
  const ref = doc(db, OFFICERS_COLLECTION, profile.officerId);
  await setDoc(ref, {
    ...profile,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function updateOfficerProfile(
  officerId: string,
  updates: Partial<Omit<OfficerProfile, 'officerId' | 'createdAt'>>
): Promise<void> {
  const ref = doc(db, OFFICERS_COLLECTION, officerId);
  await updateDoc(ref, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}
