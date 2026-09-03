import { RuleDefinition } from './validationTypes';

export const VALIDATION_RULE_REGISTRY: RuleDefinition[] = [
  // Master Data Hierarchy Rules
  {
    ruleId: 'MD-DIST-001',
    name: 'District Master Data Match',
    description: 'Validates that the extracted district exists in the configured master data.',
    category: 'MASTER_DATA',
    defaultSeverity: 'ERROR',
    applicableDocTypes: ['ALL'],
  },
  {
    ruleId: 'MD-REV-001',
    name: 'Revenue Division Hierarchy Match',
    description: 'Validates that the extracted revenue division belongs to the stated district.',
    category: 'MASTER_DATA',
    defaultSeverity: 'ERROR',
    applicableDocTypes: ['ALL'],
  },
  {
    ruleId: 'MD-MANDAL-001',
    name: 'Mandal Hierarchy Match',
    description: 'Validates that the extracted mandal belongs to the stated revenue division and district.',
    category: 'MASTER_DATA',
    defaultSeverity: 'ERROR',
    applicableDocTypes: ['ALL'],
  },
  {
    ruleId: 'MD-VILLAGE-001',
    name: 'Village / Ward Hierarchy Match',
    description: 'Validates that the extracted village belongs to the stated mandal and district.',
    category: 'MASTER_DATA',
    defaultSeverity: 'ERROR',
    applicableDocTypes: ['ALL'],
  },
  {
    ruleId: 'MD-SECRETARIAT-001',
    name: 'Secretariat / Sachivalayam Match',
    description: 'Validates that the extracted secretariat matches the village hierarchy where available.',
    category: 'MASTER_DATA',
    defaultSeverity: 'WARNING',
    applicableDocTypes: ['ALL'],
  },

  // Survey Number Rules
  {
    ruleId: 'SURVEY-FMT-001',
    name: 'Survey Number Format Validation',
    description: 'Validates that the survey number conforms to standard numeric or sub-division patterns.',
    category: 'SURVEY_NUMBER',
    defaultSeverity: 'WARNING',
    applicableDocTypes: ['ADANGAL', 'ROR_1B', 'MUTATION', 'PARTITION_SUCCESSION', 'PATTADAR_PASSBOOK_TITLE_DEED', 'LEGACY_REVENUE_RECORD'],
  },
  {
    ruleId: 'SURVEY-SUBDIV-001',
    name: 'Sub-Division Consistency Validation',
    description: 'Validates that sub-division number is properly separated from survey number.',
    category: 'SURVEY_NUMBER',
    defaultSeverity: 'INFO',
    applicableDocTypes: ['ALL'],
  },

  // Extent Rules
  {
    ruleId: 'EXTENT-FMT-001',
    name: 'Extent Numeric Format & Unit Check',
    description: 'Validates extent formatting, unit presence (Acres/Cents), and numeric range.',
    category: 'EXTENT',
    defaultSeverity: 'WARNING',
    applicableDocTypes: ['ADANGAL', 'ROR_1B', 'MUTATION', 'PARTITION_SUCCESSION', 'PATTADAR_PASSBOOK_TITLE_DEED'],
  },
  {
    ruleId: 'EXTENT-VALUE-001',
    name: 'Extent Non-Negative Numeric Range Check',
    description: 'Validates that extent value is positive and within realistic land parcel bounds.',
    category: 'EXTENT',
    defaultSeverity: 'ERROR',
    applicableDocTypes: ['ALL'],
  },

  // Land Classification Rules
  {
    ruleId: 'CLASSIFICATION-001',
    name: 'Land Classification Reference Check',
    description: 'Validates land classification against standard revenue types (Wet, Dry, Wet Irrigation, Poramboke, etc.).',
    category: 'LAND_CLASSIFICATION',
    defaultSeverity: 'WARNING',
    applicableDocTypes: ['ADANGAL', 'ROR_1B', 'PATTADAR_PASSBOOK_TITLE_DEED'],
  },

  // Owner & Party Consistency Rules
  {
    ruleId: 'OWNER-PARTY-001',
    name: 'Owner & Party Information Consistency',
    description: 'Validates consistency between pattadar/owner name, guardian name, and party share lists.',
    category: 'OWNER_PARTY',
    defaultSeverity: 'WARNING',
    applicableDocTypes: ['ALL'],
  },

  // Required Field Rules by Category
  {
    ruleId: 'REQUIRED-ADANGAL-001',
    name: 'Adangal Mandatory Field Completeness',
    description: 'Validates presence of ownerName, surveyNumber, extent, and village for Adangal records.',
    category: 'REQUIRED_FIELD',
    defaultSeverity: 'ERROR',
    applicableDocTypes: ['ADANGAL'],
  },
  {
    ruleId: 'REQUIRED-ROR1B-001',
    name: 'RoR-1B Mandatory Field Completeness',
    description: 'Validates presence of khataNumber, ownerName, surveyNumber, and extent for RoR-1B records.',
    category: 'REQUIRED_FIELD',
    defaultSeverity: 'ERROR',
    applicableDocTypes: ['ROR_1B'],
  },

  // Cross-Field Rules
  {
    ruleId: 'CROSS-HIER-001',
    name: 'Administrative Location Cross-Field Hierarchy Check',
    description: 'Validates full 4-tier location chain (District -> Division -> Mandal -> Village).',
    category: 'CROSS_FIELD',
    defaultSeverity: 'ERROR',
    applicableDocTypes: ['ALL'],
  },
];
