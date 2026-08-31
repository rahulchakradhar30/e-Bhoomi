/**
 * e-Bhoomi Application Central Configuration
 * 
 * SIH Prototype Active Scope: Andhra Pradesh — Kurnool District
 * Architecture supports future multi-state & multi-lingual expansion via configuration.
 */

export interface SupportedLanguage {
  code: string;
  name: string;
  localName: string;
}

export interface AppConfig {
  activeState: string;
  activeStateCode: string;
  activeStateShortCode: string;
  activeStateLocalName: string;
  
  activeDistrict: string;
  activeDistrictCode: string;
  activeDistrictDisplayCode: string;
  activeDistrictLocalName: string;

  supportedStates: string[];
  supportedLanguages: SupportedLanguage[];
  defaultLanguage: string;

  activeDocumentFamilies: string[];
}

export const APP_CONFIG: AppConfig = {
  activeState: 'Andhra Pradesh',
  activeStateCode: '28',
  activeStateShortCode: 'AP',
  activeStateLocalName: 'ఆంధ్రప్రదేశ్',

  activeDistrict: 'Kurnool',
  activeDistrictCode: '511',
  activeDistrictDisplayCode: 'KUR',
  activeDistrictLocalName: 'కర్నూలు',

  supportedStates: ['AP'],

  supportedLanguages: [
    { code: 'te', name: 'Telugu', localName: 'తెలుగు' },
    { code: 'en', name: 'English', localName: 'English' }
  ],
  defaultLanguage: 'en',

  activeDocumentFamilies: [
    'Adangal / Pahani',
    'ROR 1-B',
    'Mutation Record',
    'Partition / Succession Record'
  ]
};
