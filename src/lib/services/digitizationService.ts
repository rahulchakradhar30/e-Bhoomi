import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { DigitizationCaseDocument } from '../../types/digitizationCase';

const DIGITIZATION_CASES_COLLECTION = 'digitizationCases';

export async function getDigitizationCase(caseId: string): Promise<DigitizationCaseDocument | null> {
  const ref = doc(db, DIGITIZATION_CASES_COLLECTION, caseId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as DigitizationCaseDocument;
  }
  return null;
}

export async function getAssignedCasesForOfficer(
  officerId: string
): Promise<DigitizationCaseDocument[]> {
  const q = query(
    collection(db, DIGITIZATION_CASES_COLLECTION),
    where('assignedOfficer', '==', officerId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as DigitizationCaseDocument);
}

export async function createDigitizationCase(caseDoc: DigitizationCaseDocument): Promise<void> {
  const ref = doc(db, DIGITIZATION_CASES_COLLECTION, caseDoc.caseId);
  await setDoc(ref, {
    ...caseDoc,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function updateDigitizationCase(
  caseId: string,
  updates: Partial<Omit<DigitizationCaseDocument, 'caseId' | 'createdAt'>>
): Promise<void> {
  const ref = doc(db, DIGITIZATION_CASES_COLLECTION, caseId);
  await updateDoc(ref, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}
