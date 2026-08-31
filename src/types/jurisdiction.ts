export type JurisdictionLevel =
  | 'STATE'
  | 'DISTRICT'
  | 'REVENUE_DIVISION'
  | 'MANDAL'
  | 'VILLAGE';

export interface JurisdictionNode {
  id: string;
  level: JurisdictionLevel;
  stateId: string;
  districtId?: string;
  revenueDivisionId?: string;
  mandalOrTalukId?: string;
  villageId?: string;
  name: string;
  lgdCode?: string;
  parentJurisdictionId?: string;
  createdAt: string;
  updatedAt: string;
}
