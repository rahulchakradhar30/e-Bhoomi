import { DocumentCategoryCode } from './digitizationSchemas';

export interface FieldSchemaDefinition {
  name: string;
  dataType: 'string' | 'number' | 'date' | 'array' | 'object';
  required: boolean;
  labelEn: string;
  labelTe: string;
  description: string;
  validationRegex?: string;
  schemaVersion: string;
}

export interface PartySchemaDefinition {
  nameField: FieldSchemaDefinition;
  relationshipField: FieldSchemaDefinition;
  shareField: FieldSchemaDefinition;
  extentField: FieldSchemaDefinition;
  roleField: FieldSchemaDefinition;
}

export interface BoundarySchemaDefinition {
  east: FieldSchemaDefinition;
  west: FieldSchemaDefinition;
  north: FieldSchemaDefinition;
  south: FieldSchemaDefinition;
}

export interface DocumentSchemaDefinition {
  schemaId: string;
  documentCategory: DocumentCategoryCode;
  version: string;
  titleEn: string;
  titleTe: string;
  description: string;
  commonFields: FieldSchemaDefinition[];
  boundaries: BoundarySchemaDefinition;
  partiesStructure?: PartySchemaDefinition;
  categorySpecificFields: FieldSchemaDefinition[];
}

export const COMMON_LAND_FIELD_SCHEMAS: Record<string, FieldSchemaDefinition> = {
  ownerName: {
    name: 'ownerName',
    dataType: 'string',
    required: true,
    labelEn: 'Pattadar / Owner Name',
    labelTe: 'పట్టాదారు పేరు',
    description: 'Name of registered pattadar or title holder.',
    schemaVersion: '1.0',
  },
  fatherOrHusbandName: {
    name: 'fatherOrHusbandName',
    dataType: 'string',
    required: true,
    labelEn: 'Father / Husband Name',
    labelTe: 'తండ్రి / భర్త పేరు',
    description: 'Parental or marital guardian relationship name.',
    schemaVersion: '1.0',
  },
  surveyNumber: {
    name: 'surveyNumber',
    dataType: 'string',
    required: true,
    labelEn: 'Survey Number',
    labelTe: 'సర్వే నంబరు',
    description: 'Revenue survey parcel number.',
    validationRegex: '^[0-9A-Za-z/-]+$',
    schemaVersion: '1.0',
  },
  subDivisionNumber: {
    name: 'subDivisionNumber',
    dataType: 'string',
    required: false,
    labelEn: 'Sub-Division Number',
    labelTe: 'సబ్‌డివిజన్ నంబరు',
    description: 'Sub-division suffix letter/number.',
    schemaVersion: '1.0',
  },
  khataNumber: {
    name: 'khataNumber',
    dataType: 'string',
    required: false,
    labelEn: 'Khata Number',
    labelTe: 'ఖాతా నంబరు',
    description: 'Revenue account khata number.',
    schemaVersion: '1.0',
  },
  extent: {
    name: 'extent',
    dataType: 'number',
    required: true,
    labelEn: 'Land Extent (Acres.Cents)',
    labelTe: 'భూమి విస్తీర్ణం (ఎకరాలు.సెంట్లు)',
    description: 'Land area in acres and cents.',
    schemaVersion: '1.0',
  },
  landClassification: {
    name: 'landClassification',
    dataType: 'string',
    required: true,
    labelEn: 'Land Classification',
    labelTe: 'భూమి వర్గీకరణ',
    description: 'Wet, Dry, Inam, or Government land type.',
    schemaVersion: '1.0',
  },
  district: {
    name: 'district',
    dataType: 'string',
    required: true,
    labelEn: 'District Name',
    labelTe: 'జిల్లా పేరు',
    description: 'Administrative district.',
    schemaVersion: '1.0',
  },
  revenueDivision: {
    name: 'revenueDivision',
    dataType: 'string',
    required: true,
    labelEn: 'Revenue Division Name',
    labelTe: 'రెవెన్యూ డివిజన్ పేరు',
    description: 'Administrative revenue division.',
    schemaVersion: '1.0',
  },
  mandal: {
    name: 'mandal',
    dataType: 'string',
    required: true,
    labelEn: 'Mandal Name',
    labelTe: 'మండలం పేరు',
    description: 'Mandal or subdistrict.',
    schemaVersion: '1.0',
  },
  village: {
    name: 'village',
    dataType: 'string',
    required: true,
    labelEn: 'Village Name',
    labelTe: 'గ్రామం పేరు',
    description: 'Revenue village.',
    schemaVersion: '1.0',
  },
  documentDate: {
    name: 'documentDate',
    dataType: 'date',
    required: false,
    labelEn: 'Document / Proceeding Date',
    labelTe: 'పత్రం / ప్రొసీడింగ్ తేదీ',
    description: 'Date of execution or revenue proceeding.',
    schemaVersion: '1.0',
  },
};

export const STANDARD_BOUNDARIES_SCHEMA: BoundarySchemaDefinition = {
  east: {
    name: 'eastBoundary',
    dataType: 'string',
    required: false,
    labelEn: 'East Boundary',
    labelTe: 'తూర్పు సరిహద్దు',
    description: 'Eastern boundary description.',
    schemaVersion: '1.0',
  },
  west: {
    name: 'westBoundary',
    dataType: 'string',
    required: false,
    labelEn: 'West Boundary',
    labelTe: 'పశ్చిమ సరిహద్దు',
    description: 'Western boundary description.',
    schemaVersion: '1.0',
  },
  north: {
    name: 'northBoundary',
    dataType: 'string',
    required: false,
    labelEn: 'North Boundary',
    labelTe: 'ఉత్తర సరిహద్దు',
    description: 'Northern boundary description.',
    schemaVersion: '1.0',
  },
  south: {
    name: 'southBoundary',
    dataType: 'string',
    required: false,
    labelEn: 'South Boundary',
    labelTe: 'దక్షిణ సరిహద్దు',
    description: 'Southern boundary description.',
    schemaVersion: '1.0',
  },
};

export const REPEATABLE_PARTIES_SCHEMA: PartySchemaDefinition = {
  nameField: {
    name: 'partyName',
    dataType: 'string',
    required: true,
    labelEn: 'Party / Heir Name',
    labelTe: 'వారసుడు / పక్షం పేరు',
    description: 'Individual party name in partition or succession.',
    schemaVersion: '1.0',
  },
  relationshipField: {
    name: 'relationship',
    dataType: 'string',
    required: true,
    labelEn: 'Relationship to Ancestor',
    labelTe: 'పూర్వీకునితో సంబంధం',
    description: 'e.g. Son of, Daughter of, Wife of.',
    schemaVersion: '1.0',
  },
  shareField: {
    name: 'shareFraction',
    dataType: 'string',
    required: true,
    labelEn: 'Inherited / Partition Share',
    labelTe: 'పంపకపు వాటా',
    description: 'e.g. 1/2 share, 1/4 share, 25%.',
    schemaVersion: '1.0',
  },
  extentField: {
    name: 'partitionExtent',
    dataType: 'number',
    required: true,
    labelEn: 'Allotted Extent (Acres.Cents)',
    labelTe: 'కేటాయించిన విస్తీర్ణం',
    description: 'Area allotted to specific party.',
    schemaVersion: '1.0',
  },
  roleField: {
    name: 'partyRole',
    dataType: 'string',
    required: true,
    labelEn: 'Party Role in Partition',
    labelTe: 'పక్షము పాత్ర',
    description: 'e.g. Ancestral Owner, Co-sharer, Beneficiary.',
    schemaVersion: '1.0',
  },
};

export class DocumentSchemaRegistry {
  private static schemas: Map<DocumentCategoryCode, DocumentSchemaDefinition> = new Map();

  static initializeDefaults() {
    if (this.schemas.size > 0) return;

    // 1. ADANGAL Schema
    this.schemas.set('ADANGAL', {
      schemaId: 'SCHEMA-ADANGAL-V1.0',
      documentCategory: 'ADANGAL',
      version: '1.0',
      titleEn: 'Adangal Extraction Schema',
      titleTe: 'అడంగల్ ఎక్స్‌ట్రాక్షన్ స్కీమా',
      description: 'Schema definition for annual village land possession and crop cultivation registers.',
      commonFields: Object.values(COMMON_LAND_FIELD_SCHEMAS),
      boundaries: STANDARD_BOUNDARIES_SCHEMA,
      categorySpecificFields: [
        {
          name: 'cultivatorName',
          dataType: 'string',
          required: false,
          labelEn: 'Cultivator / Anubhavadar Name',
          labelTe: 'సాగుదారు / అనుభవదారు పేరు',
          description: 'Name of person currently cultivating the parcel.',
          schemaVersion: '1.0',
        },
        {
          name: 'cropDetails',
          dataType: 'string',
          required: false,
          labelEn: 'Crop / Season Details',
          labelTe: 'పంట / కాలం వివరాలు',
          description: 'Seasonal crop category.',
          schemaVersion: '1.0',
        },
      ],
    });

    // 2. ROR_1B Schema
    this.schemas.set('ROR_1B', {
      schemaId: 'SCHEMA-ROR1B-V1.0',
      documentCategory: 'ROR_1B',
      version: '1.0',
      titleEn: 'RoR-1B Record of Rights Schema',
      titleTe: 'ఆర్.ఓ.ఆర్-1బి హక్కుల రికార్డు స్కీమా',
      description: 'Schema definition for official legal register of rights and Khata accounts.',
      commonFields: Object.values(COMMON_LAND_FIELD_SCHEMAS),
      boundaries: STANDARD_BOUNDARIES_SCHEMA,
      categorySpecificFields: [
        {
          name: 'passbookNumberRef',
          dataType: 'string',
          required: false,
          labelEn: 'Pattadar Passbook Reference No',
          labelTe: 'పాస్‌బుక్ రెఫరెన్స్ నంబరు',
          description: 'Cross-referenced passbook number in RoR register.',
          schemaVersion: '1.0',
        },
      ],
    });

    // 3. MUTATION Schema
    this.schemas.set('MUTATION', {
      schemaId: 'SCHEMA-MUTATION-V1.0',
      documentCategory: 'MUTATION',
      version: '1.0',
      titleEn: 'Mutation Proceeding Schema',
      titleTe: 'మ్యూటేషన్ నడపడి స్కీమా',
      description: 'Schema for title transfer proceedings following sale, gift, or inheritance.',
      commonFields: Object.values(COMMON_LAND_FIELD_SCHEMAS),
      boundaries: STANDARD_BOUNDARIES_SCHEMA,
      categorySpecificFields: [
        {
          name: 'mutationProceedingNumber',
          dataType: 'string',
          required: true,
          labelEn: 'Tahsildar Proceeding No & Year',
          labelTe: 'తహశీల్దార్ ప్రొసీడింగ్ నంబరు & సంవత్సరం',
          description: 'Official mutation proceeding reference.',
          schemaVersion: '1.0',
        },
        {
          name: 'transferorName',
          dataType: 'string',
          required: true,
          labelEn: 'Transferor / Previous Owner Name',
          labelTe: 'బదిలీదారు / పూర్వ యజమాని పేరు',
          description: 'Original title holder executing transfer.',
          schemaVersion: '1.0',
        },
        {
          name: 'transfereeName',
          dataType: 'string',
          required: true,
          labelEn: 'Transferee / New Owner Name',
          labelTe: 'బదిలీ పొందిన / నూతన యజమాని పేరు',
          description: 'New title holder receiving ownership.',
          schemaVersion: '1.0',
        },
      ],
    });

    // 4. PARTITION Schema
    this.schemas.set('PARTITION', {
      schemaId: 'SCHEMA-PARTITION-V1.0',
      documentCategory: 'PARTITION',
      version: '1.0',
      titleEn: 'Partition & Family Succession Schema',
      titleTe: 'విభజన మరియు కుటుంబ వారసత్వ స్కీమా',
      description: 'Schema for family partition deeds specifying multi-party inheritance shares.',
      commonFields: Object.values(COMMON_LAND_FIELD_SCHEMAS),
      boundaries: STANDARD_BOUNDARIES_SCHEMA,
      partiesStructure: REPEATABLE_PARTIES_SCHEMA,
      categorySpecificFields: [
        {
          name: 'ancestralPattadarName',
          dataType: 'string',
          required: true,
          labelEn: 'Ancestral Original Pattadar Name',
          labelTe: 'మూల / పూర్వీకుల పట్టాదారు పేరు',
          description: 'Original head of family owning undivided parcel.',
          schemaVersion: '1.0',
        },
      ],
    });

    // 5. PASSBOOK Schema
    this.schemas.set('PASSBOOK', {
      schemaId: 'SCHEMA-PASSBOOK-V1.0',
      documentCategory: 'PASSBOOK',
      version: '1.0',
      titleEn: 'Pattadar Passbook & Title Deed Schema',
      titleTe: 'పట్టాదారు పాస్‌బుక్ & టైటిల్ డీడ్ స్కీమా',
      description: 'Schema for official government title deed and passbook schedules.',
      commonFields: Object.values(COMMON_LAND_FIELD_SCHEMAS),
      boundaries: STANDARD_BOUNDARIES_SCHEMA,
      categorySpecificFields: [
        {
          name: 'passbookTitleDeedNumber',
          dataType: 'string',
          required: true,
          labelEn: 'Passbook / Title Deed Serial Number',
          labelTe: 'పాస్‌బుక్ / టైటిల్ డీడ్ నంబరు',
          description: 'Government security code on title deed.',
          schemaVersion: '1.0',
        },
      ],
    });

    // 6. LEGACY_REVENUE Schema
    this.schemas.set('LEGACY_REVENUE', {
      schemaId: 'SCHEMA-LEGACY-V1.0',
      documentCategory: 'LEGACY_REVENUE',
      version: '1.0',
      titleEn: 'Archival Legacy Revenue Record Schema',
      titleTe: 'చారిత్రక పాత రెవెన్యూ రికార్డు స్కీమా',
      description: 'Schema for historical Inam registers, Resurvey Fair Adangal, and Nizam Sethwar records.',
      commonFields: Object.values(COMMON_LAND_FIELD_SCHEMAS),
      boundaries: STANDARD_BOUNDARIES_SCHEMA,
      categorySpecificFields: [
        {
          name: 'historicalRegisterType',
          dataType: 'string',
          required: true,
          labelEn: 'Historical Register Name & Period',
          labelTe: 'చారిత్రక రిజిస్టర్ పేరు & కాలం',
          description: 'e.g. 1920 Inam Fair Adangal, Sethwar 1348F.',
          schemaVersion: '1.0',
        },
        {
          name: 'oldSurveyNumber',
          dataType: 'string',
          required: false,
          labelEn: 'Old Survey / Pre-resurvey No',
          labelTe: 'పాత సర్వే నంబరు',
          description: 'Historical survey parcel designation.',
          schemaVersion: '1.0',
        },
      ],
    });
  }

  static getSchema(category: DocumentCategoryCode): DocumentSchemaDefinition {
    this.initializeDefaults();
    return (
      this.schemas.get(category) ||
      this.schemas.get('ADANGAL')!
    );
  }

  static getAllSchemas(): DocumentSchemaDefinition[] {
    this.initializeDefaults();
    return Array.from(this.schemas.values());
  }
}
