import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { DigitizationCaseDocument, AuditTimelineEvent } from '../../types/digitizationCase';

const DIGITIZATION_CASES_COLLECTION = 'digitizationCases';

export async function getDigitizationCase(caseId: string): Promise<DigitizationCaseDocument | null> {
  try {
    const ref = doc(db, DIGITIZATION_CASES_COLLECTION, caseId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as DigitizationCaseDocument;
    }
  } catch (err) {
    console.error('Failed to get digitization case:', err);
  }
  return null;
}

export async function getAssignedCasesForOfficer(
  officerId: string
): Promise<DigitizationCaseDocument[]> {
  try {
    const q = query(
      collection(db, DIGITIZATION_CASES_COLLECTION),
      where('createdBy', '==', officerId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as DigitizationCaseDocument);
  } catch (err) {
    console.error('Failed to get cases for officer:', err);
    return [];
  }
}

export async function getActiveDraftForOfficer(
  officerId: string
): Promise<DigitizationCaseDocument | null> {
  try {
    const q = query(
      collection(db, DIGITIZATION_CASES_COLLECTION),
      where('createdBy', '==', officerId),
      where('workflowStatus', '==', 'DRAFT')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as DigitizationCaseDocument;
    }
  } catch (err) {
    console.error('Failed to query draft case:', err);
  }
  return null;
}

export async function getCasesForJurisdiction(
  districtCode?: string,
  mandalCode?: string,
  villageCode?: string
): Promise<DigitizationCaseDocument[]> {
  try {
    let q = query(collection(db, DIGITIZATION_CASES_COLLECTION));
    if (villageCode) {
      q = query(collection(db, DIGITIZATION_CASES_COLLECTION), where('villageCode', '==', villageCode));
    } else if (mandalCode) {
      q = query(collection(db, DIGITIZATION_CASES_COLLECTION), where('mandalCode', '==', mandalCode));
    } else if (districtCode) {
      q = query(collection(db, DIGITIZATION_CASES_COLLECTION), where('districtCode', '==', districtCode));
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as DigitizationCaseDocument);
  } catch (err) {
    console.error('Failed to query jurisdiction cases:', err);
    return [];
  }
}

export async function createDigitizationCase(caseDoc: DigitizationCaseDocument): Promise<void> {
  const ref = doc(db, DIGITIZATION_CASES_COLLECTION, caseDoc.caseId);
  const now = new Date().toISOString();
  await setDoc(ref, {
    ...caseDoc,
    createdAt: caseDoc.createdAt || now,
    updatedAt: now,
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

export async function appendAuditLog(
  caseId: string,
  event: Omit<AuditTimelineEvent, 'eventId' | 'timestamp'>
): Promise<void> {
  const existing = await getDigitizationCase(caseId);
  if (!existing) return;

  const newEvent: AuditTimelineEvent = {
    eventId: `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...event,
  };

  const auditTrail = [...(existing.auditTrail || []), newEvent];
  await updateDigitizationCase(caseId, { auditTrail });
}
