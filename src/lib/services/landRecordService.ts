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
import { LandRecordDocument } from '../../types/landRecord';

const LAND_RECORDS_COLLECTION = 'landRecords';
const LOCAL_STORAGE_KEY = 'ebhoomi_land_records_cache';

function getLocalLandRecordsCache(): LandRecordDocument[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Could not read local land records cache:', err);
    return [];
  }
}

function updateLocalLandRecordsCache(record: LandRecordDocument) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalLandRecordsCache();
    const filtered = existing.filter((r) => r.recordId !== record.recordId);
    const updated = [record, ...filtered];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Could not save to local land records cache:', err);
  }
}

export async function getLandRecord(recordId: string): Promise<LandRecordDocument | null> {
  try {
    const ref = doc(db, LAND_RECORDS_COLLECTION, recordId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as LandRecordDocument;
      updateLocalLandRecordsCache(data);
      return data;
    }
  } catch (err) {
    console.warn('Failed to get land record from Firestore, checking local cache:', err);
  }

  const local = getLocalLandRecordsCache();
  return local.find((r) => r.recordId === recordId) || null;
}

export async function queryLandRecordsBySurvey(
  districtId: string,
  mandalOrTalukId: string,
  villageId: string,
  surveyNumber: string
): Promise<LandRecordDocument[]> {
  const local = getLocalLandRecordsCache().filter(
    (r) =>
      (r.districtId === districtId || !districtId) &&
      (r.mandalOrTalukId === mandalOrTalukId || !mandalOrTalukId) &&
      (r.villageId === villageId || !villageId) &&
      (r.surveyNumber === surveyNumber || !surveyNumber) &&
      ['VERIFIED', 'FIELD_VERIFIED', 'MRO_APPROVED'].includes(r.verificationStatus)
  );

  try {
    let q = query(
      collection(db, LAND_RECORDS_COLLECTION),
      where('districtId', '==', districtId),
      where('mandalOrTalukId', '==', mandalOrTalukId),
      where('villageId', '==', villageId)
    );

    if (surveyNumber) {
      q = query(
        collection(db, LAND_RECORDS_COLLECTION),
        where('districtId', '==', districtId),
        where('mandalOrTalukId', '==', mandalOrTalukId),
        where('villageId', '==', villageId),
        where('surveyNumber', '==', surveyNumber)
      );
    }

    const snap = await getDocs(q);
    const fromDb = snap.docs.map((d) => d.data() as LandRecordDocument);
    fromDb.forEach(updateLocalLandRecordsCache);

    const mergedMap = new Map<string, LandRecordDocument>();
    local.forEach((r) => mergedMap.set(r.recordId, r));
    fromDb.forEach((r) => mergedMap.set(r.recordId, r));

    return Array.from(mergedMap.values()).filter((r) =>
      ['VERIFIED', 'FIELD_VERIFIED', 'MRO_APPROVED'].includes(r.verificationStatus)
    );
  } catch (err) {
    console.warn('Firestore queryLandRecordsBySurvey failed, falling back to local cache:', err);
    return local;
  }
}

export async function queryVerifiedSurveyNumbersForLocation(
  districtId: string,
  mandalId: string,
  villageId: string
): Promise<string[]> {
  const localMatches = getLocalLandRecordsCache().filter(
    (r) =>
      (r.districtId === districtId || !districtId) &&
      (r.mandalOrTalukId === mandalId || !mandalId) &&
      (r.villageId === villageId || !villageId) &&
      ['VERIFIED', 'FIELD_VERIFIED', 'MRO_APPROVED'].includes(r.verificationStatus)
  );

  const surveys = new Set<string>();
  localMatches.forEach((r) => {
    if (r.surveyNumber) surveys.add(r.surveyNumber);
  });

  try {
    const q = query(
      collection(db, LAND_RECORDS_COLLECTION),
      where('districtId', '==', districtId),
      where('mandalOrTalukId', '==', mandalId),
      where('villageId', '==', villageId)
    );
    const snap = await getDocs(q);
    snap.docs.forEach((d) => {
      const data = d.data() as LandRecordDocument;
      updateLocalLandRecordsCache(data);
      if (['VERIFIED', 'FIELD_VERIFIED', 'MRO_APPROVED'].includes(data.verificationStatus) && data.surveyNumber) {
        surveys.add(data.surveyNumber);
      }
    });
  } catch (err) {
    console.warn('Firestore queryVerifiedSurveyNumbersForLocation failed:', err);
  }

  return Array.from(surveys).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

export async function createLandRecord(record: LandRecordDocument): Promise<void> {
  const now = new Date().toISOString();
  const prepared: LandRecordDocument = {
    ...record,
    createdAt: record.createdAt || now,
    updatedAt: now,
  };

  updateLocalLandRecordsCache(prepared);

  try {
    const ref = doc(db, LAND_RECORDS_COLLECTION, record.recordId);
    await setDoc(ref, prepared, { merge: true });
  } catch (err) {
    console.warn('Firestore setDoc failed for landRecord, local cache preserved:', err);
  }
}

export async function updateLandRecord(
  recordId: string,
  updates: Partial<Omit<LandRecordDocument, 'recordId' | 'createdAt'>>
): Promise<void> {
  const existing = await getLandRecord(recordId);
  const now = new Date().toISOString();
  if (existing) {
    const updated = { ...existing, ...updates, updatedAt: now };
    updateLocalLandRecordsCache(updated);
  }

  try {
    const ref = doc(db, LAND_RECORDS_COLLECTION, recordId);
    await updateDoc(ref, {
      ...updates,
      updatedAt: now,
    });
  } catch (err) {
    console.warn('Firestore updateDoc failed for landRecord, local cache preserved:', err);
  }
}

export interface PublicLandRecordView {
  id: string;
  recordId: string;
  stateId: string;
  districtId: string;
  revenueDivisionId: string;
  mandalOrTalukId: string;
  villageId: string;
  stateName: string;
  districtName: string;
  revenueDivisionName: string;
  mandalName: string;
  villageName: string;
  surveyNumber: string;
  subdivisionNumber: string;
  subDivisionNumber: string;
  khataNumber: string;
  extent: number;
  extentAcres: string;
  landClassification: string;
  landType: string;
  recordType: string;
  status: string;
  digitizationStatus: 'Not Digitized' | 'Processing' | 'Digitized' | 'Verified' | 'Field Verification Completed';
  verificationStatus: 'Pending Verification' | 'Verified' | 'Requires Review' | 'Correction Requested';
  lastApprovedVersion?: string;
  sourceRecordReference?: string;
}

/**
 * Filter public-facing fields from full land record document.
 * Removes restricted personal identifiers and private officer logs.
 */
export function filterPublicFields(record: LandRecordDocument): PublicLandRecordView {
  return {
    id: record.recordId,
    recordId: record.recordId,
    stateId: record.stateId || '28',
    districtId: record.districtId || '511',
    revenueDivisionId: record.revenueDivisionId || '',
    mandalOrTalukId: record.mandalOrTalukId || '',
    villageId: record.villageId || '',
    stateName: record.stateName || 'Andhra Pradesh',
    districtName: record.districtName || 'Kurnool',
    revenueDivisionName: record.revenueDivisionName || 'Kurnool Revenue Division',
    mandalName: record.mandalName || '',
    villageName: record.villageName || '',
    surveyNumber: record.surveyNumber || '',
    subdivisionNumber: record.subDivisionNumber || '1',
    subDivisionNumber: record.subDivisionNumber || '1',
    khataNumber: record.khataNumber || 'Not available',
    extent: record.extent || 0,
    extentAcres: record.extent ? record.extent.toString() : '0.00',
    landClassification: record.landClassification || record.landType || 'Agricultural Land',
    landType: record.landType || record.landClassification || 'Agricultural Land',
    recordType: record.recordType || 'ROR_1B',
    status: record.status || 'ACTIVE',
    digitizationStatus: (record.digitizationStatus as any) || 'Digitized',
    verificationStatus: (record.verificationStatus === 'VERIFIED' || record.verificationStatus === 'FIELD_VERIFIED' || record.verificationStatus === 'MRO_APPROVED')
      ? 'Verified'
      : 'Pending Verification',
    lastApprovedVersion: record.currentVersionId || '2026-AP-REV-v1',
    sourceRecordReference: `LGD-AP-${record.districtId || '511'}-${record.villageId || 'VIL'}-${record.surveyNumber || '101'}`
  };
}
