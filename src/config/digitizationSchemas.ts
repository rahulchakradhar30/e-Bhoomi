export type DocumentCategoryCode =
  | 'ADANGAL'
  | 'ROR_1B'
  | 'MUTATION'
  | 'PARTITION'
  | 'PASSBOOK'
  | 'LEGACY_REVENUE';

export interface DocumentTypeConfig {
  code: DocumentCategoryCode;
  titleEn: string;
  titleTe: string;
  subtitleEn: string;
  subtitleTe: string;
  iconName: string;
  description: string;
  checklistFields: Array<{ id: string; labelEn: string; labelTe: string }>;
}

export const SUPPORTED_DOCUMENT_TYPES: DocumentTypeConfig[] = [
  {
    code: 'ADANGAL',
    titleEn: 'Adangal',
    titleTe: 'అడంగల్',
    subtitleEn: 'Village Land Possession & Cultivation Record',
    subtitleTe: 'గ్రామ భూ సాగు మరియు స్వాధీనం రికార్డు',
    iconName: 'FileText',
    description: 'Annual village record containing land category, cultivator details, extent, and crop details.',
    checklistFields: [
      { id: 'ownerName', labelEn: 'Pattadar / Owner Name', labelTe: 'పట్టాదారు పేరు' },
      { id: 'surveyNumber', labelEn: 'Survey & Sub-Division Number', labelTe: 'సర్వే మరియు సబ్‌డివిజన్ నంబరు' },
      { id: 'extent', labelEn: 'Extent / Land Area', labelTe: 'భూమి విస్తీర్ణం' },
      { id: 'landClassification', labelEn: 'Land Classification (Dry/Wet/Inam)', labelTe: 'భూమి వర్గీకరణ' },
      { id: 'village', labelEn: 'Village & Mandal Name', labelTe: 'గ్రామం మరియు మండలం పేరు' },
      { id: 'boundaries', labelEn: 'Four Side Boundaries (E/W/N/S)', labelTe: 'నాలుగు వైపుల సరిహద్దులు' },
    ],
  },
  {
    code: 'ROR_1B',
    titleEn: 'RoR-1B / Record of Rights',
    titleTe: 'ఆర్.ఓ.ఆర్ – 1-బి / హక్కుల రికార్డు',
    subtitleEn: 'Official Register of Rights & Khata Details',
    subtitleTe: 'అధికారిక హక్కుల రికార్డు మరియు ఖాతా వివరాలు',
    iconName: 'ShieldCheck',
    description: 'Primary legal record of land rights showing Khata number, Pattadar details, and land extent.',
    checklistFields: [
      { id: 'khataNumber', labelEn: 'Khata Number', labelTe: 'ఖాతా నంబరు' },
      { id: 'ownerName', labelEn: 'Pattadar Name & Father/Husband Name', labelTe: 'పట్టాదారు & తండ్రి/భర్త పేరు' },
      { id: 'surveyNumber', labelEn: 'Survey Number', labelTe: 'సర్వే నంబరు' },
      { id: 'extent', labelEn: 'Extent in Acres/Cents', labelTe: 'విస్తీర్ణం (ఎకరాలు/సెంట్లు)' },
      { id: 'districtMandal', labelEn: 'District, Mandal & Village', labelTe: 'జిల్లా, మండలం & గ్రామం' },
    ],
  },
  {
    code: 'MUTATION',
    titleEn: 'Mutation / Name Transfer Record',
    titleTe: 'మ్యూటేషన్ రికార్డు / పేరుమార్పు రికార్డు',
    subtitleEn: 'Title Transfer & Revenue Proceeding Record',
    subtitleTe: 'హక్కుల మార్పిడి మరియు రెవెన్యూ నడపడి రికార్డు',
    iconName: 'RefreshCw',
    description: 'Official proceedings ordering mutation of land title following sale, gift, or inheritance.',
    checklistFields: [
      { id: 'mutationRef', labelEn: 'Mutation Proceeding Number & Date', labelTe: 'మ్యూటేషన్ నడపడి సంఖ్య & తేదీ' },
      { id: 'transferorName', labelEn: 'Transferor / Previous Owner Name', labelTe: 'బదిలీదారు / పూర్వ యజమాని పేరు' },
      { id: 'transfereeName', labelEn: 'Transferee / New Owner Name', labelTe: 'బదిలీ పొందిన / నూతన యజమాని పేరు' },
      { id: 'surveyExtent', labelEn: 'Survey Number & Transferred Extent', labelTe: 'సర్వే నంబరు & బదిలీ విస్తీర్ణం' },
    ],
  },
  {
    code: 'PARTITION',
    titleEn: 'Partition / Succession Record',
    titleTe: 'విభజన / వారసత్వ రికార్డు',
    subtitleEn: 'Family Inheritance & Land Division Record',
    subtitleTe: 'కుటుంబ ఆస్తి పంపకం మరియు వారసత్వ రికార్డు',
    iconName: 'Users',
    description: 'Document specifying family partition hierarchy (e.g. Father → Sons/Daughters), individual shares, and survey extents.',
    checklistFields: [
      { id: 'ancestralOwner', labelEn: 'Original / Ancestral Pattadar Name', labelTe: 'మూల / పూర్వీకుల పట్టాదారు పేరు' },
      { id: 'partiesList', labelEn: 'List of Heirs/Parties & Share Entitlements', labelTe: 'వారసుల జాబితా & వాటాల వివరాలు' },
      { id: 'surveyDivisions', labelEn: 'Sub-divided Survey Numbers & Extents', labelTe: 'విభజించబడిన సర్వే నంబర్లు & విస్తీర్ణాలు' },
      { id: 'partitionDate', labelEn: 'Partition Document Date & Reference', labelTe: 'పంపకాల పత్రం తేదీ & రెఫరెన్స్' },
    ],
  },
  {
    code: 'PASSBOOK',
    titleEn: 'Pattadar Passbook / Title Deed',
    titleTe: 'పట్టాదారు పాస్బుక్ / టైటిల్ డీడ్',
    subtitleEn: 'e-Pattadar Passbook & Legal Ownership Record',
    subtitleTe: 'ఈ-పట్టాదారు పాస్‌బుక్ & చట్టబద్ధ యాజమాన్య హక్కు పత్రం',
    iconName: 'BookOpen',
    description: 'Government issued title deed and passbook containing photograph, khata, and land schedule.',
    checklistFields: [
      { id: 'passbookNumber', labelEn: 'Passbook / Title Deed Number', labelTe: 'పాస్‌బుక్ / టైటిల్ డీడ్ నంబరు' },
      { id: 'pattadarDetails', labelEn: 'Pattadar Name, Guardian & Address', labelTe: 'పట్టాదారు పేరు, సంరక్షకుడు & విలాసం' },
      { id: 'landSchedule', labelEn: 'Land Schedule (Survey Nos & Extents)', labelTe: 'భూమి షెడ్యూల్ (సర్వే నంబర్లు & విస్తీర్ణాలు)' },
      { id: 'issuingAuthority', labelEn: 'Issuing Officer & Digital Signature', labelTe: 'జారీ చేసిన అధికారి & డిజిటల్ సంతకం' },
    ],
  },
  {
    code: 'LEGACY_REVENUE',
    titleEn: 'Legacy Revenue Record',
    titleTe: 'పాత రెవెన్యూ రికార్డు',
    subtitleEn: 'Archival Inam / Settlement Register / Fair Adangal',
    subtitleTe: 'చారిత్రక ఇనాం / సెటిల్మెంట్ రిజిస్టర్ / ఫెయిర్ అడంగల్',
    iconName: 'Archive',
    description: 'Historical revenue record, Resurvey Fair Adangal, Inam Register, or Nizam Sethwar document.',
    checklistFields: [
      { id: 'registerType', labelEn: 'Historical Register Type & Year', labelTe: 'చారిత్రక రిజిస్టర్ రకం & సంవత్సరం' },
      { id: 'oldNewSurvey', labelEn: 'Old Survey No vs Re-survey No', labelTe: 'పాత సర్వే నంబరు vs రీ-సర్వే నంబరు' },
      { id: 'legalClassification', labelEn: 'Historical Classification & Tenancy', labelTe: 'చారిత్రక వర్గీకరణ & కౌలు వివరాలు' },
    ],
  },
];

export interface SourceEvidence {
  sourcePage: number;
  sourceText: string;
}

export interface ExtractedField<T = string> {
  fieldId: string;
  labelEn: string;
  labelTe: string;
  value: T;
  confidence: number; // 0 to 1
  evidence?: SourceEvidence;
}

export interface PartyShare {
  name: string;
  relationship: string; // e.g., "Son of Rama Rao", "Daughter"
  share: string; // e.g., "1/4 share", "25%"
  extent: string; // e.g., "1.25 Acres"
  surveyNumber?: string;
}

export interface LandBoundaries {
  east: string;
  west: string;
  north: string;
  south: string;
}

export interface StructuredLandRecordData {
  ownerName: ExtractedField<string>;
  fatherOrHusbandName: ExtractedField<string>;
  surveyNumber: ExtractedField<string>;
  subDivisionNumber: ExtractedField<string>;
  khataNumber: ExtractedField<string>;
  extentAcres: ExtractedField<string>;
  landClassification: ExtractedField<string>;
  villageName: ExtractedField<string>;
  mandalName: ExtractedField<string>;
  revenueDivision: ExtractedField<string>;
  districtName: ExtractedField<string>;
  documentDate: ExtractedField<string>;
  registrationRef?: ExtractedField<string>;
  mutationRef?: ExtractedField<string>;
  boundaries: {
    east: ExtractedField<string>;
    west: ExtractedField<string>;
    north: ExtractedField<string>;
    south: ExtractedField<string>;
  };
  parties?: ExtractedField<PartyShare[]>;
  additionalNotes?: ExtractedField<string>;
}
