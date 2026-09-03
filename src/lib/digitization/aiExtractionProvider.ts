import { DocumentCategoryCode, StructuredLandRecordData } from '@/config/digitizationSchemas';
import { OCRResult } from './ocrProvider';

export interface AIExtractionResult {
  documentType: DocumentCategoryCode;
  structuredData: StructuredLandRecordData;
  overallConfidence: number;
  providerName: string;
  modelIdentifier: string;
  extractedAt: string;
}

export interface AIExtractionProvider {
  extractStructuredData(
    ocrResult: OCRResult,
    documentType: DocumentCategoryCode
  ): Promise<AIExtractionResult>;
}

export class DefaultAIExtractionProvider implements AIExtractionProvider {
  async extractStructuredData(
    ocrResult: OCRResult,
    documentType: DocumentCategoryCode
  ): Promise<AIExtractionResult> {
    const structuredData: StructuredLandRecordData = {
      ownerName: {
        fieldId: 'ownerName',
        labelEn: 'Pattadar / Owner Name',
        labelTe: 'పట్టాదారు పేరు',
        value: '',
        confidence: 0,
      },
      fatherOrHusbandName: {
        fieldId: 'fatherOrHusbandName',
        labelEn: 'Father / Husband Name',
        labelTe: 'తండ్రి / భర్త పేరు',
        value: '',
        confidence: 0,
      },
      surveyNumber: {
        fieldId: 'surveyNumber',
        labelEn: 'Survey Number',
        labelTe: 'సర్వే నంబరు',
        value: '',
        confidence: 0,
      },
      subDivisionNumber: {
        fieldId: 'subDivisionNumber',
        labelEn: 'Sub-Division Number',
        labelTe: 'సబ్‌డివిజన్ నంబరు',
        value: '',
        confidence: 0,
      },
      khataNumber: {
        fieldId: 'khataNumber',
        labelEn: 'Khata Number',
        labelTe: 'ఖాతా నంబరు',
        value: '',
        confidence: 0,
      },
      extentAcres: {
        fieldId: 'extentAcres',
        labelEn: 'Extent (Acres.Cents)',
        labelTe: 'విస్తీర్ణం (ఎకరాలు.సెంట్లు)',
        value: '',
        confidence: 0,
      },
      landClassification: {
        fieldId: 'landClassification',
        labelEn: 'Land Classification',
        labelTe: 'భూమి వర్గీకరణ',
        value: '',
        confidence: 0,
      },
      villageName: {
        fieldId: 'villageName',
        labelEn: 'Village Name',
        labelTe: 'గ్రామం పేరు',
        value: '',
        confidence: 0,
      },
      mandalName: {
        fieldId: 'mandalName',
        labelEn: 'Mandal Name',
        labelTe: 'మండలం పేరు',
        value: '',
        confidence: 0,
      },
      revenueDivision: {
        fieldId: 'revenueDivision',
        labelEn: 'Revenue Division',
        labelTe: 'రెవెన్యూ డివిజన్',
        value: '',
        confidence: 0,
      },
      districtName: {
        fieldId: 'districtName',
        labelEn: 'District Name',
        labelTe: 'జిల్లా పేరు',
        value: '',
        confidence: 0,
      },
      documentDate: {
        fieldId: 'documentDate',
        labelEn: 'Record / Proceeding Date',
        labelTe: 'రికార్డు / ప్రొసీడింగ్ తేదీ',
        value: '',
        confidence: 0,
      },
      boundaries: {
        east: {
          fieldId: 'boundaryEast',
          labelEn: 'East Boundary',
          labelTe: 'తూర్పు సరిహద్దు',
          value: '',
          confidence: 0,
        },
        west: {
          fieldId: 'boundaryWest',
          labelEn: 'West Boundary',
          labelTe: 'పశ్చిమ సరిహద్దు',
          value: '',
          confidence: 0,
        },
        north: {
          fieldId: 'boundaryNorth',
          labelEn: 'North Boundary',
          labelTe: 'ఉత్తర సరిహద్దు',
          value: '',
          confidence: 0,
        },
        south: {
          fieldId: 'boundarySouth',
          labelEn: 'South Boundary',
          labelTe: 'దక్షిణ సరిహద్దు',
          value: '',
          confidence: 0,
        },
      },
    };

    return {
      documentType,
      structuredData,
      overallConfidence: 0,
      providerName: 'eBhoomi Document Intelligence Engine (Extraction Pending AI Model Phase)',
      modelIdentifier: 'ebhoomi-ai-pending',
      extractedAt: new Date().toISOString(),
    };
  }
}
