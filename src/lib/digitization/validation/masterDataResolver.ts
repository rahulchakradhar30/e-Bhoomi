import { MasterDataEntity, MasterMatchLevel } from './validationTypes';

export interface ResolutionResult {
  matchLevel: MasterMatchLevel;
  entity?: MasterDataEntity;
  matchedName?: string;
  matchedCode?: string;
  matchedId?: string;
  candidateMatches?: MasterDataEntity[];
}

export class MasterDataResolver {
  public static MASTER_DATA_VERSION = '2025.1-Kurnool';

  // Kurnool District Administrative Hierarchy
  private districts: MasterDataEntity[] = [
    { id: 'DIST-545', code: '545', nameEn: 'Kurnool', nameTe: 'కర్నూలు', type: 'DISTRICT', aliases: ['కర్నూల్', 'Kurnool District'] },
    { id: 'DIST-546', code: '546', nameEn: 'Nandyal', nameTe: 'నంద్యాల', type: 'DISTRICT', aliases: ['Nandyala'] },
    { id: 'DIST-547', code: '547', nameEn: 'Anantapur', nameTe: 'అనంతపురం', type: 'DISTRICT', aliases: ['Anantapuramu'] },
  ];

  private revenueDivisions: MasterDataEntity[] = [
    { id: 'RD-545-01', code: '545-01', nameEn: 'Kurnool', nameTe: 'కర్నూలు', parentId: 'DIST-545', type: 'REVENUE_DIVISION' },
    { id: 'RD-545-02', code: '545-02', nameEn: 'Adoni', nameTe: 'అడోని', parentId: 'DIST-545', type: 'REVENUE_DIVISION' },
    { id: 'RD-545-03', code: '545-03', nameEn: 'Pattikonda', nameTe: 'పత్తికొండ', parentId: 'DIST-545', type: 'REVENUE_DIVISION' },
  ];

  private mandals: MasterDataEntity[] = [
    { id: 'MAN-5101', code: '5101', nameEn: 'Kurnool Urban', nameTe: 'కర్నూలు అర్బన్', parentId: 'RD-545-01', type: 'MANDAL' },
    { id: 'MAN-5102', code: '5102', nameEn: 'Kurnool Rural', nameTe: 'కర్నూలు రూరల్', parentId: 'RD-545-01', type: 'MANDAL' },
    { id: 'MAN-5103', code: '5103', nameEn: 'Adoni', nameTe: 'అడోని', parentId: 'RD-545-02', type: 'MANDAL', aliases: ['అడోని మండలం', 'Adoni Mandal'] },
    { id: 'MAN-5104', code: '5104', nameEn: 'Gooty', nameTe: 'గుత్తి', parentId: 'RD-545-02', type: 'MANDAL' },
    { id: 'MAN-5105', code: '5105', nameEn: 'Pattikonda', nameTe: 'పత్తికొండ', parentId: 'RD-545-03', type: 'MANDAL' },
  ];

  private villages: MasterDataEntity[] = [
    { id: 'VIL-600101', code: '600101', nameEn: 'Arjanapalle', nameTe: 'ఆర్జనపల్లె', parentId: 'MAN-5103', type: 'VILLAGE', aliases: ['Arjanapalli'] },
    { id: 'VIL-600102', code: '600102', nameEn: 'Gooty Village', nameTe: 'గుత్తి', parentId: 'MAN-5104', type: 'VILLAGE' },
    { id: 'VIL-600103', code: '600103', nameEn: 'Ulchala', nameTe: 'ఉల్చాల', parentId: 'MAN-5102', type: 'VILLAGE' },
    { id: 'VIL-600104', code: '600104', nameEn: 'Joharapuram', nameTe: 'జోహరాపురం', parentId: 'MAN-5101', type: 'VILLAGE' },
  ];

  private secretariats: MasterDataEntity[] = [
    { id: 'SEC-700101', code: '700101', nameEn: 'Arjanapalle Secretariat', nameTe: 'ఆర్జనపల్లె సచివాలయం', parentId: 'VIL-600101', type: 'SECRETARIAT' },
    { id: 'SEC-700102', code: '700102', nameEn: 'Ulchala Sachivalayam', nameTe: 'ఉల్చాల సచివాలయం', parentId: 'VIL-600103', type: 'SECRETARIAT' },
  ];

  public resolveDistrict(query: string): ResolutionResult {
    return this._resolveEntity(query, this.districts);
  }

  public resolveRevenueDivision(query: string, districtId?: string): ResolutionResult {
    let pool = this.revenueDivisions;
    if (districtId) {
      pool = pool.filter((e) => e.parentId === districtId);
    }
    return this._resolveEntity(query, pool);
  }

  public resolveMandal(query: string, divisionId?: string, districtId?: string): ResolutionResult {
    let pool = this.mandals;
    if (divisionId) {
      pool = pool.filter((e) => e.parentId === divisionId);
    } else if (districtId) {
      const validDivs = this.revenueDivisions.filter((d) => d.parentId === districtId).map((d) => d.id);
      pool = pool.filter((e) => e.parentId && validDivs.includes(e.parentId));
    }
    return this._resolveEntity(query, pool);
  }

  public resolveVillage(query: string, mandalId?: string): ResolutionResult {
    let pool = this.villages;
    if (mandalId) {
      pool = pool.filter((e) => e.parentId === mandalId);
    }
    return this._resolveEntity(query, pool);
  }

  public resolveSecretariat(query: string, villageId?: string): ResolutionResult {
    let pool = this.secretariats;
    if (villageId) {
      pool = pool.filter((e) => e.parentId === villageId);
    }
    return this._resolveEntity(query, pool);
  }

  private _resolveEntity(query: string, pool: MasterDataEntity[]): ResolutionResult {
    if (!query || !query.trim()) {
      return { matchLevel: 'NO_MATCH' };
    }

    const q = query.trim();
    const normQ = this._normalizeString(q);

    // 1. Exact Name/Code Match
    for (const item of pool) {
      if (item.nameEn === q || item.nameTe === q || item.code === q || item.id === q) {
        return {
          matchLevel: 'EXACT',
          entity: item,
          matchedName: item.nameEn,
          matchedCode: item.code,
          matchedId: item.id,
        };
      }
    }

    // 2. Normalized Exact Match
    for (const item of pool) {
      if (this._normalizeString(item.nameEn) === normQ || this._normalizeString(item.nameTe) === normQ) {
        return {
          matchLevel: 'NORMALIZED_EXACT',
          entity: item,
          matchedName: item.nameEn,
          matchedCode: item.code,
          matchedId: item.id,
        };
      }
    }

    // 3. Controlled Alias Match
    for (const item of pool) {
      if (item.aliases && item.aliases.some((a) => this._normalizeString(a) === normQ || a === q)) {
        return {
          matchLevel: 'CONTROLLED_ALIAS',
          entity: item,
          matchedName: item.nameEn,
          matchedCode: item.code,
          matchedId: item.id,
        };
      }
    }

    // 4. Fuzzy Candidate Match
    const candidates: MasterDataEntity[] = [];
    for (const item of pool) {
      const nEn = this._normalizeString(item.nameEn);
      const nTe = this._normalizeString(item.nameTe);
      if (nEn.includes(normQ) || normQ.includes(nEn) || nTe.includes(normQ) || normQ.includes(nTe)) {
        candidates.push(item);
      }
    }

    if (candidates.length > 0) {
      return {
        matchLevel: 'FUZZY_CANDIDATE',
        entity: candidates[0],
        matchedName: candidates[0].nameEn,
        matchedCode: candidates[0].code,
        matchedId: candidates[0].id,
        candidateMatches: candidates,
      };
    }

    return { matchLevel: 'NO_MATCH' };
  }

  private _normalizeString(str: string): string {
    return str
      .toLowerCase()
      .replace(/[\.\,\-\_\/\s]/g, '')
      .replace(/మండలం|మండలము|జిల్లా|సచివాలయం|రూరల్|అర్బన్/g, '');
  }
}
