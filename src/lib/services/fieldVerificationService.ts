import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firestore';

const VERIFICATIONS_COLLECTION = 'fieldVerifications';

export interface FieldVerification {
  id: string;
  caseId: string;
  officerUid: string;
  remarks: string;
  fieldBookRef?: string;
  status: 'PENDING' | 'COMPLETED' | 'DISCREPANCY_FOUND';
  createdAt: string;
  updatedAt: string;
}

export async function getFieldVerification(id: string): Promise<FieldVerification | null> {
  const ref = doc(db, VERIFICATIONS_COLLECTION, id);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as FieldVerification;
  }
  return null;
}

export async function getFieldVerificationsByCase(caseId: string): Promise<FieldVerification[]> {
  const q = query(
    collection(db, VERIFICATIONS_COLLECTION),
    where('caseId', '==', caseId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as FieldVerification);
}

export async function createFieldVerification(verification: FieldVerification): Promise<void> {
  const ref = doc(db, VERIFICATIONS_COLLECTION, verification.id);
  await setDoc(ref, {
    ...verification,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function updateFieldVerification(
  id: string,
  updates: Partial<Omit<FieldVerification, 'id' | 'createdAt'>>
): Promise<void> {
  const ref = doc(db, VERIFICATIONS_COLLECTION, id);
  await updateDoc(ref, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}
