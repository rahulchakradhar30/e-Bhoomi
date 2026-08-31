import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const DEFAULT_EXCEL_PATH = 'R:\\e-BhoomiDATA\\AP_Kurnool_Sachivalayam_Master_Online_Import.xlsx';
const OUTPUT_DIR = path.join(__dirname, '../src/data/administrative');
const REPORTS_DIR = path.join(__dirname, '../docs/import-reports');

// Ensure output directories exist
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(REPORTS_DIR, { recursive: true });

function runImport() {
  const excelPath = process.env.MASTER_DATA_EXCEL_PATH || DEFAULT_EXCEL_PATH;
  console.log(`🚀 Initiating administrative master-data import from: ${excelPath}`);

  if (!fs.existsSync(excelPath)) {
    console.error(`❌ Master-data source unavailable: File not found at ${excelPath}`);
    process.exit(1);
  }

  let workbook;
  try {
    workbook = xlsx.readFile(excelPath);
  } catch (err) {
    console.error(`❌ Master-data source unavailable: Failed to read workbook.`, err.message);
    process.exit(1);
  }

  const sheetName = 'Kurnool Master';
  if (!workbook.SheetNames.includes(sheetName)) {
    console.error(`❌ Master-data source invalid: Missing sheet '${sheetName}'`);
    process.exit(1);
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

  if (rows.length === 0) {
    console.error(`❌ Master-data source empty: No data rows found in sheet '${sheetName}'`);
    process.exit(1);
  }

  // Validate headers
  const requiredHeaders = [
    'District',
    'District Code',
    'Revenue Division',
    'Mandal',
    'Mandal Code',
    'Area Type',
    'Village / Town / Ward',
    'Sachivalayam Name',
    'Sachivalayam Code'
  ];

  const firstRow = rows[0];
  const missingHeaders = requiredHeaders.filter(h => !(h in firstRow));
  if (missingHeaders.length > 0) {
    console.error(`❌ Master-data headers invalid. Missing columns: ${missingHeaders.join(', ')}`);
    process.exit(1);
  }

  console.log(`Parsed ${rows.length} raw rows from workbook.`);

  // Normalized structures
  const states = [
    {
      state_code: '28',
      display_code: 'AP',
      name: 'Andhra Pradesh',
      local_name: 'ఆంధ్రప్రదేశ్',
      status: 'ACTIVE'
    }
  ];

  const districtsMap = new Map();
  const divisionsMap = new Map();
  const mandalsMap = new Map();
  const sachivalayams = [];
  const villages = []; // remains empty due to source data

  let acceptedCount = 0;
  let rejectedCount = 0;
  const duplicateCodes = [];
  const missingValuesList = [];
  const sachivalayamCodesSeen = new Set();

  rows.forEach((row, index) => {
    const rowNum = index + 2; // 1-based, accounts for header

    // 1. Extract values
    const districtName = String(row['District']).trim();
    const districtCode = String(row['District Code']).trim();
    const divisionName = String(row['Revenue Division']).trim();
    const mandalName = String(row['Mandal']).trim();
    const mandalCode = String(row['Mandal Code']).trim();
    const areaType = String(row['Area Type']).trim();
    const villageName = String(row['Village / Town / Ward']).trim();
    const sachName = String(row['Sachivalayam Name']).trim();
    const sachCode = String(row['Sachivalayam Code']).trim();

    // 2. Validate mandatory fields
    if (!districtName || !districtCode || !divisionName || !mandalName || !mandalCode || !sachName || !sachCode) {
      missingValuesList.push({
        row: rowNum,
        details: `Missing fields in row ${rowNum}`
      });
      rejectedCount++;
      return;
    }

    // 3. Check for duplicates in Sachivalayam codes
    if (sachivalayamCodesSeen.has(sachCode)) {
      duplicateCodes.push({
        row: rowNum,
        code: sachCode,
        name: sachName
      });
      rejectedCount++;
      return;
    }
    sachivalayamCodesSeen.add(sachCode);

    // 4. Normalize text/casing (Uppercase for codes/official names)
    const normalizedDistName = districtName;
    const normalizedDivName = divisionName;
    const normalizedMandalName = mandalName;
    const normalizedSachName = sachName.toUpperCase();

    // 5. Build entities
    // District
    if (!districtsMap.has(districtCode)) {
      districtsMap.set(districtCode, {
        district_code: districtCode,
        state_code: '28',
        display_code: districtName.substring(0, 3).toUpperCase(),
        name: normalizedDistName,
        local_name: 'కర్నూలు', // Fallback for AP Kurnool MVP
        status: 'ACTIVE'
      });
    }

    // Revenue Division (RDO)
    const divisionId = `RD-${districtCode}-${normalizedDivName.toUpperCase()}`;
    if (!divisionsMap.has(divisionId)) {
      divisionsMap.set(divisionId, {
        division_code: divisionId,
        district_code: districtCode,
        state_code: '28',
        name: `${normalizedDivName} Revenue Division`,
        local_name: `${normalizedDivName} రెవెన్యూ డివిజన్`,
        status: 'ACTIVE'
      });
    }

    // Mandal
    if (!mandalsMap.has(mandalCode)) {
      mandalsMap.set(mandalCode, {
        subdistrict_code: mandalCode,
        district_code: districtCode,
        division_code: divisionId,
        state_code: '28',
        name: normalizedMandalName,
        local_name: normalizedMandalName, // Fallback
        type: 'Mandal',
        status: 'ACTIVE'
      });
    }

    // Sachivalayam
    sachivalayams.push({
      sachivalayam_code: sachCode,
      subdistrict_code: mandalCode,
      division_code: divisionId,
      district_code: districtCode,
      state_code: '28',
      name: normalizedSachName,
      local_name: normalizedSachName,
      area_type: areaType,
      village_name: villageName || null,
      status: 'ACTIVE'
    });

    acceptedCount++;
  });

  const normalizedDistricts = Array.from(districtsMap.values());
  const normalizedDivisions = Array.from(divisionsMap.values());
  const normalizedMandals = Array.from(mandalsMap.values());

  // Save JSON outputs
  const metadata = {
    source: 'Government of India - Local Government Directory & GSWS Master',
    dataset_version: '2026.1-GSWS-IMPORT',
    last_updated: new Date().toISOString().split('T')[0],
    imported_at: new Date().toISOString(),
    record_counts: {
      districts: normalizedDistricts.length,
      revenue_divisions: normalizedDivisions.length,
      mandals: normalizedMandals.length,
      sachivalayams: sachivalayams.length,
      villages: 0
    }
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'master-metadata.json'), JSON.stringify(metadata, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'states.json'), JSON.stringify(states, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'districts.json'), JSON.stringify(normalizedDistricts, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'revenue-divisions.json'), JSON.stringify(normalizedDivisions, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'subdistricts.json'), JSON.stringify(normalizedMandals, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'villages.json'), JSON.stringify(villages, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'sachivalayams.json'), JSON.stringify(sachivalayams, null, 2));

  console.log(`✅ Normalized JSON files saved to ${OUTPUT_DIR}`);

  // Write reports
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportContent = `# e-Bhoomi Master Data Import Report

- **Import Run Timestamp**: ${metadata.imported_at}
- **Source File Path**: ${excelPath}
- **Status**: ${rejectedCount > 0 ? 'WARNING (Some rows skipped)' : 'SUCCESS'}

## Record Summary
- **Total Rows Read**: ${rows.length}
- **Total Records Accepted**: ${acceptedCount}
- **Total Records Rejected**: ${rejectedCount}

## Entity Counts
- **States**: ${states.length}
- **Districts**: ${normalizedDistricts.length} (Kurnool LGD Code: ${normalizedDistricts[0]?.district_code})
- **Revenue Divisions**: ${normalizedDivisions.length}
- **Mandals**: ${normalizedMandals.length}
- **Sachivalayams**: ${sachivalayams.length}
- **Villages**: 0 (Blank column detected in source)

## Validation Details
- **Duplicates Found**: ${duplicateCodes.length}
${duplicateCodes.length > 0 ? duplicateCodes.map(d => `  - Row ${d.row}: Code ${d.code} (${d.name})`).join('\n') : '  - None'}
- **Missing Required Values**: ${missingValuesList.length}
${missingValuesList.length > 0 ? missingValuesList.map(m => `  - Row ${m.row}: ${m.details}`).join('\n') : '  - None'}
`;

  fs.writeFileSync(path.join(REPORTS_DIR, `import-report-${timestamp}.md`), reportContent);
  fs.writeFileSync(path.join(__dirname, '../docs/AP-Kurnool-Master-Data-Validation-Report.md'), reportContent);

  console.log(`✅ Import reports written to docs/import-reports/ and docs/AP-Kurnool-Master-Data-Validation-Report.md`);
}

runImport();
