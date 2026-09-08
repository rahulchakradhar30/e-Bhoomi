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

  // All 26 Andhra Pradesh Districts Administrative Master Data
  private districts: MasterDataEntity[] = [
    { id: 'DIST-545', code: '545', nameEn: 'Kurnool', nameTe: 'కర్నూలు', type: 'DISTRICT', aliases: ['కర్నూల్', 'Kurnool District', '511'] },
    { id: 'DIST-546', code: '546', nameEn: 'Nandyal', nameTe: 'నంద్యాల', type: 'DISTRICT', aliases: ['నంద్యాల్', 'Nandyala', '753'] },
    { id: 'DIST-547', code: '547', nameEn: 'Anantapur', nameTe: 'అనంతపురం', type: 'DISTRICT', aliases: ['అనంతపూర్', 'Anantapuramu', '502'] },
    { id: 'DIST-548', code: '548', nameEn: 'Sri Sathya Sai', nameTe: 'శ్రీ సత్యసాయి', type: 'DISTRICT', aliases: ['సత్యసాయి', 'Puttaparthi'] },
    { id: 'DIST-504', code: '504', nameEn: 'YSR Kadapa', nameTe: 'వైఎస్ఆర్ కడప', type: 'DISTRICT', aliases: ['కడప', 'Kadapa', 'Cuddapah'] },
    { id: 'DIST-754', code: '754', nameEn: 'Annamayya', nameTe: 'అన్నమయ్య', type: 'DISTRICT', aliases: ['Rayachoti', 'రాయచోటి'] },
    { id: 'DIST-503', code: '503', nameEn: 'Chittoor', nameTe: 'చిత్తూరు', type: 'DISTRICT', aliases: ['చిత్తూర్', 'Chittoor District'] },
    { id: 'DIST-755', code: '755', nameEn: 'Tirupati', nameTe: 'తిరుపతి', type: 'DISTRICT', aliases: ['Sri Balaji'] },
    { id: 'DIST-515', code: '515', nameEn: 'SPSR Nellore', nameTe: 'శ్రీ పొట్టి శ్రీరాములు నెల్లూరు', type: 'DISTRICT', aliases: ['నెల్లూరు', 'Nellore'] },
    { id: 'DIST-517', code: '517', nameEn: 'Prakasam', nameTe: 'ప్రకాశం', type: 'DISTRICT', aliases: ['ఒంగోలు', 'Ongole'] },
    { id: 'DIST-756', code: '756', nameEn: 'Bapatla', nameTe: 'బాపట్ల', type: 'DISTRICT', aliases: ['Bapatla District'] },
    { id: 'DIST-757', code: '757', nameEn: 'Palnadu', nameTe: 'పల్నాడు', type: 'DISTRICT', aliases: ['Narasaraopet', 'నరసరావుపేట'] },
    { id: 'DIST-506', code: '506', nameEn: 'Guntur', nameTe: 'గుంటూరు', type: 'DISTRICT', aliases: ['గుంటూర్', 'Guntur District'] },
    { id: 'DIST-510', code: '510', nameEn: 'Krishna', nameTe: 'కృష్ణా', type: 'DISTRICT', aliases: ['మచిలీపట్నం', 'Machilipatnam'] },
    { id: 'DIST-758', code: '758', nameEn: 'NTR', nameTe: 'ఎన్టీఆర్', type: 'DISTRICT', aliases: ['విజయవాడ', 'Vijayawada'] },
    { id: 'DIST-523', code: '523', nameEn: 'West Godavari', nameTe: 'పశ్చిమ గోదావరి', type: 'DISTRICT', aliases: ['భీమవరం', 'Bhimavaram'] },
    { id: 'DIST-759', code: '759', nameEn: 'Eluru', nameTe: 'ఏలూరు', type: 'DISTRICT', aliases: ['Eluru District'] },
    { id: 'DIST-505', code: '505', nameEn: 'East Godavari', nameTe: 'తూర్పు గోదావరి', type: 'DISTRICT', aliases: ['రాజమండ్రి', 'Rajahmundry'] },
    { id: 'DIST-760', code: '760', nameEn: 'Kakinada', nameTe: 'కాకినాడ', type: 'DISTRICT', aliases: ['Kakinada District'] },
    { id: 'DIST-761', code: '761', nameEn: 'Dr. B.R. Ambedkar Konaseema', nameTe: 'కోనసీమ', type: 'DISTRICT', aliases: ['అమలాపురం', 'Amalapuram'] },
    { id: 'DIST-520', code: '520', nameEn: 'Visakhapatnam', nameTe: 'విశాఖపట్నం', type: 'DISTRICT', aliases: ['వైజాగ్', 'Vizag'] },
    { id: 'DIST-762', code: '762', nameEn: 'Anakapalli', nameTe: 'అనకాపల్లి', type: 'DISTRICT', aliases: ['Anakapalle'] },
    { id: 'DIST-763', code: '763', nameEn: 'Alluri Sitharama Raju', nameTe: 'అల్లూరి సీతారామరాజు', type: 'DISTRICT', aliases: ['పాడేరు', 'Paderu'] },
    { id: 'DIST-521', code: '521', nameEn: 'Vizianagaram', nameTe: 'విజయనగరం', type: 'DISTRICT', aliases: ['విజయనగర్'] },
    { id: 'DIST-764', code: '764', nameEn: 'Parvathipuram Manyam', nameTe: 'పార్వతీపురం మన్యం', type: 'DISTRICT', aliases: ['పార్వతీపురం'] },
    { id: 'DIST-519', code: '519', nameEn: 'Srikakulam', nameTe: 'శ్రీకాకుళం', type: 'DISTRICT', aliases: ['శ్రీకాకుళం జిల్లా'] },
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
