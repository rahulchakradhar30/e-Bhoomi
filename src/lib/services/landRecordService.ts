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

export async function getLandRecord(recordId: string): Promise<LandRecordDocument | null> {
  const ref = doc(db, LAND_RECORDS_COLLECTION, recordId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as LandRecordDocument;
  }
  return null;
}

export async function queryLandRecordsBySurvey(
  districtId: string,
  mandalOrTalukId: string,
  villageId: string,
  surveyNumber: string
): Promise<LandRecordDocument[]> {
  const q = query(
    collection(db, LAND_RECORDS_COLLECTION),
    where('districtId', '==', districtId),
    where('mandalOrTalukId', '==', mandalOrTalukId),
    where('villageId', '==', villageId),
    where('surveyNumber', '==', surveyNumber)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as LandRecordDocument);
}

export async function createLandRecord(record: LandRecordDocument): Promise<void> {
  const ref = doc(db, LAND_RECORDS_COLLECTION, record.recordId);
  await setDoc(ref, {
    ...record,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function updateLandRecord(
  recordId: string,
  updates: Partial<Omit<LandRecordDocument, 'recordId' | 'createdAt'>>
): Promise<void> {
  const ref = doc(db, LAND_RECORDS_COLLECTION, recordId);
  await updateDoc(ref, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export interface PublicLandRecordView {
  recordId: string;
  stateId: string;
  districtId: string;
  revenueDivisionId: string;
  mandalOrTalukId: string;
  villageId: string;
  surveyNumber: string;
  subDivisionNumber: string;
  extent: number;
  recordType: string;
  status: string;
  verificationStatus: string;
}

/**
 * Filter public-facing fields from full land record document.
 * Removes restricted owner profiles and boundary coordinates.
 */
export function filterPublicFields(record: LandRecordDocument): PublicLandRecordView {
  return {
    recordId: record.recordId,
    stateId: record.stateId,
    districtId: record.districtId,
    revenueDivisionId: record.revenueDivisionId,
    mandalOrTalukId: record.mandalOrTalukId,
    villageId: record.villageId,
    surveyNumber: record.surveyNumber,
    subDivisionNumber: record.subDivisionNumber,
    extent: record.extent,
    recordType: record.recordType,
    status: record.status,
    verificationStatus: record.verificationStatus
  };
}

