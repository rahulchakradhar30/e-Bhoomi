/**
 * e-Bhoomi Authoritative Administrative Data Service
 * 
 * SIH Prototype Scope: Andhra Pradesh → Kurnool District
 * Serves master LGD administrative hierarchy data from authoritative JSON datasets.
 */
import masterMetadata from '../data/administrative/master-metadata.json';
import states from '../data/administrative/states.json';
import districts from '../data/administrative/districts.json';
import revenueDivisions from '../data/administrative/revenue-divisions.json';
import subdistricts from '../data/administrative/subdistricts.json';
import localities from '../data/administrative/localities.json';
import villages from '../data/administrative/villages.json';
import sachivalayams from '../data/administrative/sachivalayams.json';
import { APP_CONFIG } from '../config/appConfig';

export interface StateRecord {
  state_code: string;
  display_code?: string;
  short_code?: string;
  name: string;
  local_name?: string;
  status?: string;
}

export interface DistrictRecord {
  district_code: string;
  state_code: string;
  name: string;
  local_name: string;
  display_code: string;
}

export interface RevenueDivisionRecord {
  division_code: string;
  district_code: string;
  state_code: string;
  name: string;
  local_name: string;
}

export interface SubdistrictRecord {
  subdistrict_code: string;
  district_code: string;
  state_code: string;
  division_code: string;
  name: string;
  local_name: string;
  type: string;
}

export interface VillageRecord {
  village_code: string;
  subdistrict_code: string;
  district_code: string;
  state_code: string;
  name: string;
  local_name: string;
}

export interface MasterMetadata {
  sourceFile?: string;
  sourceSheet?: string;
  sourceVersion?: string;
  dateBasis?: string;
  importedAt?: string;
  /** Legacy field from earlier import scripts */
  source?: string;
  /** Legacy field from earlier import scripts */
  last_updated?: string;
  record_counts?: {
    districts?: number;
    revenue_divisions?: number;
    mandals?: number;
    localities?: number;
    sachivalayams?: number;
  };
}

export const getMasterMetadata = (): MasterMetadata => {
  return masterMetadata as unknown as MasterMetadata;
};

export const getActiveStateConfig = () => {
  return {
    stateName: APP_CONFIG.activeState,
    stateCode: APP_CONFIG.activeStateCode,
    shortCode: APP_CONFIG.activeStateShortCode,
    districtName: APP_CONFIG.activeDistrict,
    districtCode: APP_CONFIG.activeDistrictCode,
    displayCode: APP_CONFIG.activeDistrictDisplayCode
  };
};

export const getStates = (): StateRecord[] => {
  return (states as unknown) as StateRecord[];
};

export const getDistricts = (stateCode?: string): DistrictRecord[] => {
  const allDistricts = (districts as unknown) as DistrictRecord[];
  const filterCode = stateCode || APP_CONFIG.activeStateCode;
  return allDistricts.filter(d => d.state_code === filterCode);
};

export const getRevenueDivisions = (districtCode?: string): RevenueDivisionRecord[] => {
  const allDivisions = (revenueDivisions as unknown) as RevenueDivisionRecord[];
  const filterDist = districtCode || APP_CONFIG.activeDistrictCode;
  return allDivisions.filter(r => r.district_code === filterDist);
};

export const getSubdistricts = (stateCode?: string, districtCode?: string, divisionCode?: string): SubdistrictRecord[] => {
  let result = (subdistricts as unknown) as SubdistrictRecord[];
  const sCode = stateCode || APP_CONFIG.activeStateCode;
  const dCode = districtCode || APP_CONFIG.activeDistrictCode;

  result = result.filter(s => s.state_code === sCode && s.district_code === dCode);

  if (divisionCode) {
    result = result.filter(s => s.division_code === divisionCode);
  }
  return result;
};

export const getVillages = (subdistrictCode?: string): VillageRecord[] => {
  const allVillages = (villages as unknown) as VillageRecord[];
  if (!subdistrictCode) return allVillages;
  return allVillages.filter(v => v.subdistrict_code === subdistrictCode);
};

export interface LocalityRecord {
  locality_code: string;
  subdistrict_code: string;
  division_code: string;
  district_code: string;
  state_code: string;
  name: string;
  local_name: string;
  area_type: string;
  type: string;
  status?: string;
}

export interface SachivalayamRecord {
  sachivalayam_code: string;
  locality_code: string;
  locality_name: string;
  subdistrict_code: string;
  division_code: string;
  district_code: string;
  state_code: string;
  name: string;
  local_name: string;
  area_type: string;
  status?: string;
}

export const getMandals = (revenueDivisionId?: string): SubdistrictRecord[] => {
  const allMandals = (subdistricts as unknown) as SubdistrictRecord[];
  if (!revenueDivisionId) return allMandals;
  return allMandals.filter(m => m.division_code === revenueDivisionId);
};

export const getLocalities = (mandalId?: string): LocalityRecord[] => {
  const allLocalities = (localities as unknown) as LocalityRecord[];
  if (!mandalId) return allLocalities;
  return allLocalities.filter(l => l.subdistrict_code === mandalId);
};

export const getSachivalayams = (localityIdOrMandalId?: string): SachivalayamRecord[] => {
  const allSach = (sachivalayams as unknown) as SachivalayamRecord[];
  if (!localityIdOrMandalId) return allSach;
  
  // Importer maps both locality_code and subdistrict_code. Let's support filtering on either.
  return allSach.filter(s => 
    s.locality_code === localityIdOrMandalId || 
    s.subdistrict_code === localityIdOrMandalId
  );
};

export const searchLocations = (query?: string, stateCode?: string): DistrictRecord[] => {
  if (!query) return [];
  const q = query.toLowerCase().trim();
  const filterState = stateCode || APP_CONFIG.activeStateCode;
  
  const targetDistricts = (districts as DistrictRecord[]).filter(d => d.state_code === filterState);

  return targetDistricts.filter(d => 
    d.name.toLowerCase().includes(q) ||
    (d.local_name && d.local_name.includes(q)) ||
    d.district_code.includes(q) ||
    (d.display_code && d.display_code.toLowerCase().includes(q))
  );
};
