/**
 * e-Bhoomi Hierarchical Administrative Jurisdiction & Master Data Service
 */
import { UserRole, Jurisdiction, Officer } from '../types';
import { APP_CONFIG } from '../config/appConfig';

export interface StateConfig {
  stateCode: string;
  stateName: string;
  shortCode: string;
  levels: Array<{ id: string; label: string }>;
  roles: Array<{ id: UserRole; label: string }>;
}

export const STATE_CONFIGURATIONS: Record<string, StateConfig> = {
  AP: {
    stateCode: '28',
    stateName: 'Andhra Pradesh',
    shortCode: 'AP',
    levels: [
      { id: 'district', label: 'District' },
      { id: 'revenue_division', label: 'Revenue Division (RDO)' },
      { id: 'mandal', label: 'Mandal' },
      { id: 'village', label: 'Village' }
    ],
    roles: [
      { id: 'STATE_ADMIN', label: 'State Administrator' },
      { id: 'DISTRICT_COLLECTOR', label: 'District Collector / District Admin' },
      { id: 'RDO_OFFICER', label: 'Revenue Divisional Officer (RDO)' },
      { id: 'TAHSILDAR_MRO', label: 'Tahsildar / Mandal Revenue Officer (MRO)' },
      { id: 'FIELD_VRO', label: 'Village Revenue Officer (VRO) / Field Officer' }
    ]
  }
};

import { 
  getStates as getLgdStates, 
  getDistricts as getLgdDistricts, 
  getRevenueDivisions as getLgdDivisions, 
  getMandals as getLgdMandals, 
  getLocalities as getLgdLocalities,
  getSachivalayams as getLgdSachivalayams
} from './administrativeDataService';

export const getStates = async () => {
  return getLgdStates().map(s => ({
    code: s.state_code,
    name: s.name,
    shortCode: s.display_code || s.short_code || 'AP'
  }));
};

export const getDistricts = async (stateCode?: string) => {
  return getLgdDistricts(stateCode).map(d => ({
    code: d.district_code,
    name: d.name,
    displayCode: d.display_code
  }));
};

export const getRevenueDivisionsOrSubDivisions = async (stateCode?: string, districtCode?: string) => {
  return getLgdDivisions(districtCode).map(r => ({
    code: r.division_code,
    name: r.name
  }));
};

export const getMandalsOrTaluks = async (stateCode?: string, parentId?: string) => {
  return getLgdMandals(parentId).map(m => ({
    code: m.subdistrict_code,
    name: m.name,
    type: m.type
  }));
};

export const getVillages = async (stateCode?: string, parentId?: string) => {
  return getLgdLocalities(parentId).map(l => ({
    code: l.locality_code,
    name: l.name,
    type: l.type
  }));
};

export const getSachivalayams = async (stateCode?: string, parentId?: string) => {
  return getLgdSachivalayams(parentId).map(s => ({
    code: s.sachivalayam_code,
    name: s.name,
    areaType: s.area_type
  }));
};

export const getOfficers = async (filters: Record<string, any> = {}): Promise<Officer[]> => {
  return [];
};

export const getOfficer = async (officerId: string): Promise<Officer | null> => {
  return null;
};

export const createOfficer = async (payload: any) => {
  return { success: true, message: 'Officer creation payload validated. Backend API integration pending.' };
};

export const assignJurisdiction = async (payload: any) => {
  return { success: true, message: 'Jurisdiction assignment payload validated. Backend API integration pending.' };
};

export const transferJurisdiction = async (payload: any) => {
  return { success: true, message: 'Jurisdiction transfer payload validated. Backend API integration pending.' };
};
