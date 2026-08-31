import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { JurisdictionNode } from '../../types/jurisdiction';

const JURISDICTIONS_COLLECTION = 'jurisdictions';

export async function getJurisdiction(id: string): Promise<JurisdictionNode | null> {
  const ref = doc(db, JURISDICTIONS_COLLECTION, id);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as JurisdictionNode;
  }
  return null;
}

export async function getSubordinateJurisdictions(
  parentJurisdictionId: string
): Promise<JurisdictionNode[]> {
  const q = query(
    collection(db, JURISDICTIONS_COLLECTION),
    where('parentJurisdictionId', '==', parentJurisdictionId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as JurisdictionNode);
}
