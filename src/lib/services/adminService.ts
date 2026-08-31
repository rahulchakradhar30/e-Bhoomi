import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { UserProfile } from '../../types/user';

const ADMINS_COLLECTION = 'admins';

export interface AdminProfile {
  uid: string;
  email: string | null;
  role: 'SYSTEM_ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export async function getAdminProfile(uid: string): Promise<AdminProfile | null> {
  const ref = doc(db, ADMINS_COLLECTION, uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as AdminProfile;
  }
  return null;
}

export async function createAdminProfile(profile: AdminProfile): Promise<void> {
  const ref = doc(db, ADMINS_COLLECTION, profile.uid);
  await setDoc(ref, {
    ...profile,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function updateAdminProfile(
  uid: string,
  updates: Partial<Omit<AdminProfile, 'uid' | 'createdAt'>>
): Promise<void> {
  const ref = doc(db, ADMINS_COLLECTION, uid);
  await updateDoc(ref, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}
