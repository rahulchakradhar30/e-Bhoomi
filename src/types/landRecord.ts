export type RecordType = 'ROR_1B' | 'ADANGAL' | 'PATTADAR_PASSBOOK' | 'MUTATION';

export type VerificationStatus =
  | 'UNVERIFIED'
  | 'FIELD_VERIFIED'
  | 'MRO_APPROVED'
  | 'CORRECTION_REQUESTED'
  | 'REJECTED';

export interface LandOwner {
  id: string;
  name: string;
  fatherOrHusbandName: string;
  extentAcres: number;
  relationType: 'OWNER' | 'PATTADAR' | 'ENJOYER';
}

export interface BoundaryDetails {
  north?: string;
  south?: string;
  east?: string;
  west?: string;
}

export interface LandRecordDocument {
  recordId: string;
  stateId: string;
  districtId: string;
  revenueDivisionId: string;
  mandalOrTalukId: string;
  villageId: string;
  surveyNumber: string;
  subDivisionNumber: string;
  extent: number;
  owners: LandOwner[];
  boundaries?: BoundaryDetails;
  documentReferences: string[];
  recordType: RecordType;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  verificationStatus: VerificationStatus;
  currentVersionId: string;
  createdAt: string;
  updatedAt: string;
}
