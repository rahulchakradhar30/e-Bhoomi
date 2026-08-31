import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firestore';

const CORRECTIONS_COLLECTION = 'correctionRequests';

export interface CorrectionRequest {
  id: string;
  recordId: string;
  requestedBy: string;
  reviewerId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reasons: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getCorrectionRequest(id: string): Promise<CorrectionRequest | null> {
  const ref = doc(db, CORRECTIONS_COLLECTION, id);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as CorrectionRequest;
  }
  return null;
}

export async function getCorrectionRequestsByRecord(recordId: string): Promise<CorrectionRequest[]> {
  const q = query(
    collection(db, CORRECTIONS_COLLECTION),
    where('recordId', '==', recordId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as CorrectionRequest);
}

export async function createCorrectionRequest(request: CorrectionRequest): Promise<void> {
  const ref = doc(db, CORRECTIONS_COLLECTION, request.id);
  await setDoc(ref, {
    ...request,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function updateCorrectionRequest(
  id: string,
  updates: Partial<Omit<CorrectionRequest, 'id' | 'createdAt'>>
): Promise<void> {
  const ref = doc(db, CORRECTIONS_COLLECTION, id);
  await updateDoc(ref, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}
