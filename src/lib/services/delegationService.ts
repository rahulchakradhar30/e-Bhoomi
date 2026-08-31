import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { DelegationDocument } from '../../types/delegation';

const DELEGATIONS_COLLECTION = 'delegations';

export async function getDelegation(id: string): Promise<DelegationDocument | null> {
  const ref = doc(db, DELEGATIONS_COLLECTION, id);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as DelegationDocument;
  }
  return null;
}

export async function getActiveDelegationsForUser(uid: string): Promise<DelegationDocument[]> {
  const q = query(
    collection(db, DELEGATIONS_COLLECTION),
    where('targetUserUid', '==', uid),
    where('status', '==', 'ACTIVE')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as DelegationDocument);
}

export async function createDelegation(delegation: DelegationDocument): Promise<void> {
  const ref = doc(db, DELEGATIONS_COLLECTION, delegation.delegationId);
  await setDoc(ref, {
    ...delegation,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function updateDelegationStatus(
  id: string,
  status: DelegationDocument['status']
): Promise<void> {
  const ref = doc(db, DELEGATIONS_COLLECTION, id);
  await updateDoc(ref, {
    status,
    updatedAt: new Date().toISOString(),
  });
}
