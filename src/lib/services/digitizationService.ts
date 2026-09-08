import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { DigitizationCaseDocument, AuditTimelineEvent } from '../../types/digitizationCase';

const DIGITIZATION_CASES_COLLECTION = 'digitizationCases';
const LOCAL_STORAGE_KEY = 'ebhoomi_digitization_cases_cache';

function getLocalCache(): DigitizationCaseDocument[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Could not read local digitization cache:', err);
    return [];
  }
}

function updateLocalCache(caseDoc: DigitizationCaseDocument) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalCache();
    const filtered = existing.filter((c) => c.caseId !== caseDoc.caseId);
    const updated = [caseDoc, ...filtered];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Could not save to local digitization cache:', err);
  }
}

export async function getDigitizationCase(caseId: string): Promise<DigitizationCaseDocument | null> {
  try {
    const ref = doc(db, DIGITIZATION_CASES_COLLECTION, caseId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as DigitizationCaseDocument;
      updateLocalCache(data);
      return data;
    }
  } catch (err) {
    console.warn('Failed to get digitization case from Firestore, checking local cache:', err);
  }

  // Local fallback
  const localCases = getLocalCache();
  return localCases.find((c) => c.caseId === caseId) || null;
}

export async function getAssignedCasesForOfficer(
  officerId: string
): Promise<DigitizationCaseDocument[]> {
  const localCases = getLocalCache();
  const caseMap = new Map<string, DigitizationCaseDocument>();

  // Add local cases first
  localCases.forEach((c) => {
    if (c.createdBy === officerId || c.assignedOfficer === officerId || !officerId || c.createdBy?.includes('VRO')) {
      caseMap.set(c.caseId, c);
    }
  });

  try {
    // 1. Query by createdBy
    const q1 = query(
      collection(db, DIGITIZATION_CASES_COLLECTION),
      where('createdBy', '==', officerId)
    );
    const snap1 = await getDocs(q1);
    snap1.docs.forEach((d) => {
      const docData = d.data() as DigitizationCaseDocument;
      caseMap.set(docData.caseId, docData);
      updateLocalCache(docData);
    });

    // 2. Also query by assignedOfficer
    const q2 = query(
      collection(db, DIGITIZATION_CASES_COLLECTION),
      where('assignedOfficer', '==', officerId)
    );
    const snap2 = await getDocs(q2);
    snap2.docs.forEach((d) => {
      const docData = d.data() as DigitizationCaseDocument;
      caseMap.set(docData.caseId, docData);
      updateLocalCache(docData);
    });

    // If still 0, attempt generic fetch to handle default VRO account IDs
    if (caseMap.size === 0) {
      const snapAll = await getDocs(collection(db, DIGITIZATION_CASES_COLLECTION));
      snapAll.docs.forEach((d) => {
        const docData = d.data() as DigitizationCaseDocument;
        caseMap.set(docData.caseId, docData);
        updateLocalCache(docData);
      });
    }
  } catch (err) {
    console.warn('Firestore query failed, relying on local storage cache:', err);
  }

  const result = Array.from(caseMap.values());
  // Sort descending by createdAt/updatedAt
  result.sort((a, b) => {
    const timeA = new Date(a.finalizedAt || a.updatedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.finalizedAt || b.updatedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  return result;
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
    console.warn('Failed to query draft case from Firestore:', err);
  }

  const localCases = getLocalCache();
  return localCases.find((c) => c.workflowStatus === 'DRAFT' && (c.createdBy === officerId || !officerId)) || null;
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
    console.warn('Failed to query jurisdiction cases:', err);
    return getLocalCache();
  }
}

export async function createDigitizationCase(caseDoc: DigitizationCaseDocument): Promise<void> {
  const now = new Date().toISOString();
  const preparedDoc: DigitizationCaseDocument = {
    ...caseDoc,
    createdAt: caseDoc.createdAt || now,
    updatedAt: now,
  };

  // 1. Immediately cache locally
  updateLocalCache(preparedDoc);

  // 2. Persist to Firestore
  try {
    const ref = doc(db, DIGITIZATION_CASES_COLLECTION, caseDoc.caseId);
    await setDoc(ref, preparedDoc);
  } catch (err) {
    console.warn('Firestore setDoc failed, local cache preserved:', err);
  }
}

export async function saveDigitizationDraft(
  draftDoc: Partial<DigitizationCaseDocument>
): Promise<void> {
  if (!draftDoc.caseId) return;
  const now = new Date().toISOString();
  const updated = { ...draftDoc, workflowStatus: 'DRAFT' as const, updatedAt: now } as DigitizationCaseDocument;
  updateLocalCache(updated);

  try {
    const ref = doc(db, DIGITIZATION_CASES_COLLECTION, draftDoc.caseId);
    await setDoc(ref, updated, { merge: true });
  } catch (err) {
    console.warn('Firestore saveDraft failed, local cache preserved:', err);
  }
}

export async function updateDigitizationCase(
  caseId: string,
  updates: Partial<Omit<DigitizationCaseDocument, 'caseId' | 'createdAt'>>
): Promise<void> {
  const existing = await getDigitizationCase(caseId);
  const now = new Date().toISOString();
  if (existing) {
    const updated = { ...existing, ...updates, updatedAt: now };
    updateLocalCache(updated);
  }

  try {
    const ref = doc(db, DIGITIZATION_CASES_COLLECTION, caseId);
    await updateDoc(ref, {
      ...updates,
      updatedAt: now,
    });
  } catch (err) {
    console.warn('Firestore updateDoc failed, local cache preserved:', err);
  }
}

export async function appendAuditLog(
  caseId: string,
  event: Omit<AuditTimelineEvent, 'eventId' | 'timestamp'>
): Promise<void> {
  const existing = await getDigitizationCase(caseId);
  if (!existing) return;

  const newEvent: AuditTimelineEvent = {
    eventId: `AUD-${Date.now()}-${((existing.auditTrail?.length || 0) + 1).toString().padStart(4, '0')}`,
    timestamp: new Date().toISOString(),
    ...event,
  };

  const auditTrail = [...(existing.auditTrail || []), newEvent];
  await updateDigitizationCase(caseId, { auditTrail });
}

