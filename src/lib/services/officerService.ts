import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { OfficerProfile } from '../../types/officer';

const OFFICERS_COLLECTION = 'officers';

export async function getOfficerProfile(officerId: string): Promise<OfficerProfile | null> {
  const ref = doc(db, OFFICERS_COLLECTION, officerId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as OfficerProfile;
  }
  return null;
}

export async function getOfficerByAuthUid(authUid: string): Promise<OfficerProfile | null> {
  const q = query(
    collection(db, OFFICERS_COLLECTION),
    where('authUid', '==', authUid)
  );
  const querySnap = await getDocs(q);
  if (!querySnap.empty) {
    return querySnap.docs[0].data() as OfficerProfile;
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
