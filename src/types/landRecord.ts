export type RecordType = 'ROR_1B' | 'ADANGAL' | 'PATTADAR_PASSBOOK' | 'MUTATION' | 'PARTITION' | 'PASSBOOK' | 'LEGACY_REVENUE';

export type VerificationStatus =
  | 'UNVERIFIED'
  | 'FIELD_VERIFIED'
  | 'MRO_APPROVED'
  | 'VERIFIED'
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
  sachivalayamId?: string;
  stateName?: string;
  districtName?: string;
  revenueDivisionName?: string;
  mandalName?: string;
  villageName?: string;
  sachivalayamName?: string;
  surveyNumber: string;
  subDivisionNumber: string;
  khataNumber?: string;
  extent: number;
  landClassification?: string;
  landType?: string;
  owners: LandOwner[];
  boundaries?: BoundaryDetails;
  documentReferences: string[];
  recordType: RecordType;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  digitizationStatus?: 'Not Digitized' | 'Processing' | 'Digitized' | 'Verified' | 'Field Verification Completed' | 'COMPLETED';
  verificationStatus: VerificationStatus;
  currentVersionId: string;
  createdBy?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

