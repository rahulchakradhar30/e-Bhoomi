import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const PRIMARY_PATH = 'R:\\e-BhoomiDATA\\Kurnool_District_Sachivalayam_Master_2025_500plus(1).xlsx';
const FALLBACK_PATH = 'R:\\e-BhoomiDATA\\Kurnool_District_Sachivalayam_Master_2025_500plus.xlsx';
const OUTPUT_DIR = path.join(__dirname, '../src/data/administrative');
const REPORTS_DIR = path.join(__dirname, '../docs/import-reports');

// Ensure output directories exist
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(REPORTS_DIR, { recursive: true });

function runImport() {
  let excelPath = process.env.MASTER_DATA_EXCEL_PATH || PRIMARY_PATH;
  
  if (!fs.existsSync(excelPath)) {
    console.log(`⚠️ Primary workbook path not found at: ${excelPath}. Checking fallback...`);
    excelPath = FALLBACK_PATH;
  }

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

  const dataSheetName = 'Kurnool Sachivalayams';
  const sumSheetName = 'Summary';

  if (!workbook.SheetNames.includes(dataSheetName)) {
    console.error(`❌ Master-data source invalid: Missing sheet '${dataSheetName}'`);
    process.exit(1);
  }

  const sheet = workbook.Sheets[dataSheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

  if (rows.length === 0) {
    console.error(`❌ Master-data source empty: No data rows found in sheet '${dataSheetName}'`);
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

  console.log(`Parsed ${rows.length} rows from sheet '${dataSheetName}'`);

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
  const localitiesMap = new Map();
  const sachivalayams = [];

  let acceptedCount = 0;
  let rejectedCount = 0;
  let ruralCount = 0;
  let urbanCount = 0;

  const duplicateCodes = [];
  const missingValuesList = [];
  const validationErrors = [];
  const sachivalayamCodesSeen = new Set();
  const mandalCodesSeen = new Map(); // Code -> Name to check uniqueness

  rows.forEach((row, index) => {
    const rowNum = index + 2; // 1-based, accounts for header row

    // 1. Extract values
    const districtName = String(row['District']).trim();
    const districtCode = String(row['District Code']).trim();
    const divisionName = String(row['Revenue Division']).trim();
    const mandalName = String(row['Mandal']).trim();
    const mandalCode = String(row['Mandal Code']).trim();
    const areaType = String(row['Area Type']).trim();
    const localityName = String(row['Village / Town / Ward']).trim();
    const sachName = String(row['Sachivalayam Name']).trim();
    const sachCode = String(row['Sachivalayam Code']).trim();

    // 2. Validate required values
    if (!districtName || !districtCode || !divisionName || !mandalName || !mandalCode || !localityName || !sachName || !sachCode) {
      missingValuesList.push({
        row: rowNum,
        details: `Row contains blank mandatory fields`
      });
      rejectedCount++;
      return;
    }

    // 3. Validate Area Type
    if (areaType !== 'Rural' && areaType !== 'Urban') {
      validationErrors.push({
        row: rowNum,
        details: `Invalid Area Type: '${areaType}' (must be Rural or Urban)`
      });
      rejectedCount++;
      return;
    }

    // 4. Validate district code consistency (should be 511)
    if (districtCode !== '511') {
      validationErrors.push({
        row: rowNum,
        details: `Inconsistent District Code: '${districtCode}' (expected 511)`
      });
      rejectedCount++;
      return;
    }

    // 5. Check duplicate Sachivalayam Codes
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

    // 6. Check Mandal Code uniqueness within district
    if (mandalCodesSeen.has(mandalCode) && mandalCodesSeen.get(mandalCode) !== mandalName) {
      validationErrors.push({
        row: rowNum,
        details: `Mandal code clash: code '${mandalCode}' mapped to both '${mandalCodesSeen.get(mandalCode)}' and '${mandalName}'`
      });
      rejectedCount++;
      return;
    }
    mandalCodesSeen.set(mandalCode, mandalName);

    // 7. Casing normalization
    const normalizedDistName = districtName;
    const normalizedDivName = divisionName;
    const normalizedMandalName = mandalName;
    const normalizedLocalityName = localityName.toUpperCase();
    const normalizedSachName = sachName.toUpperCase();

    // 8. Build entities
    // District
    if (!districtsMap.has(districtCode)) {
      districtsMap.set(districtCode, {
        district_code: districtCode,
        state_code: '28',
        display_code: 'KUR',
        name: normalizedDistName,
        local_name: 'కర్నూలు',
        status: 'ACTIVE'
      });
    }

    // Division
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
        local_name: normalizedMandalName,
        type: 'Mandal',
        status: 'ACTIVE'
      });
    }

    // Locality (Village / Town / Ward)
    const cleanLocalityName = normalizedLocalityName.replace(/[^A-Z0-9]/g, '');
    const localityCode = `LOC-${mandalCode}-${cleanLocalityName}`;
    if (!localitiesMap.has(localityCode)) {
      localitiesMap.set(localityCode, {
        locality_code: localityCode,
        subdistrict_code: mandalCode,
        division_code: divisionId,
        district_code: districtCode,
        state_code: '28',
        name: normalizedLocalityName,
        local_name: normalizedLocalityName,
        area_type: areaType,
        type: areaType === 'Urban' ? 'Ward' : 'Village',
        status: 'ACTIVE'
      });
    }

    // Sachivalayam
    sachivalayams.push({
      sachivalayam_code: sachCode,
      locality_code: localityCode,
      locality_name: normalizedLocalityName,
      subdistrict_code: mandalCode,
      division_code: divisionId,
      district_code: districtCode,
      state_code: '28',
      name: normalizedSachName,
      local_name: normalizedSachName,
      area_type: areaType,
      status: 'ACTIVE'
    });

    if (areaType === 'Rural') ruralCount++;
    else urbanCount++;

    acceptedCount++;
  });

  const normalizedDistricts = Array.from(districtsMap.values());
  const normalizedDivisions = Array.from(divisionsMap.values());
  const normalizedMandals = Array.from(mandalsMap.values());
  const normalizedLocalities = Array.from(localitiesMap.values());

  // Extract Summary date basis description if Summary sheet exists
  let dateBasis = '2025-era GSWS database system';
  if (workbook.SheetNames.includes(sumSheetName)) {
    const sumSheet = workbook.Sheets[sumSheetName];
    const sumRows = xlsx.utils.sheet_to_json(sumSheet);
    const dateBasisRow = sumRows.find(r => r.Item === 'Date basis' || r.Item === 'dateBasis');
    if (dateBasisRow) {
      dateBasis = dateBasisRow.Value || dateBasisRow.Item;
    }
  }

  // Save outputs
  const metadata = {
    sourceFile: path.basename(excelPath),
    sourceSheet: dataSheetName,
    sourceVersion: '2025-GSWS-500plus',
    dateBasis: dateBasis,
    importedAt: new Date().toISOString(),
    record_counts: {
      districts: normalizedDistricts.length,
      revenue_divisions: normalizedDivisions.length,
      mandals: normalizedMandals.length,
      localities: normalizedLocalities.length,
      sachivalayams: sachivalayams.length
    }
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'master-metadata.json'), JSON.stringify(metadata, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'states.json'), JSON.stringify(states, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'districts.json'), JSON.stringify(normalizedDistricts, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'revenue-divisions.json'), JSON.stringify(normalizedDivisions, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'subdistricts.json'), JSON.stringify(normalizedMandals, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'localities.json'), JSON.stringify(normalizedLocalities, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'sachivalayams.json'), JSON.stringify(sachivalayams, null, 2));
  
  // Re-write villages.json containing same mapping for backward compatibility
  const legacyVillages = normalizedLocalities.map(loc => ({
    village_code: loc.locality_code,
    subdistrict_code: loc.subdistrict_code,
    district_code: loc.district_code,
    state_code: loc.state_code,
    name: loc.name,
    local_name: loc.local_name
  }));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'villages.json'), JSON.stringify(legacyVillages, null, 2));

  console.log(`✅ Normalized JSON files written to: ${OUTPUT_DIR}`);

  // Generate Report
  const reportContent = `# e-Bhoomi Kurnool District Master-Data Import Report

- **Import Run Timestamp**: ${metadata.importedAt}
- **Source Excel File**: ${metadata.sourceFile}
- **Primary Sheet Name**: ${dataSheetName}
- **Source Data Basis**: ${dateBasis}
- **Status**: ${rejectedCount > 0 ? 'WARNING (Some rows rejected)' : 'SUCCESS'}

## Entity Records Summary
- **Total Input Rows**: ${rows.length}
- **Total Records Accepted**: ${acceptedCount}
- **Total Records Rejected**: ${rejectedCount}

## Geographic Counts
- **States**: ${states.length} (Andhra Pradesh)
- **Districts**: ${normalizedDistricts.length} (Kurnool, LGD Code: ${districtsMap.keys().next().value})
- **Revenue Divisions**: ${normalizedDivisions.length} (Adoni, Kurnool, Pattikonda)
- **Mandals (Subdistricts)**: ${normalizedMandals.length}
- **Localities (Village/Town/Ward)**: ${normalizedLocalities.length}
- **Sachivalayams (Secretariats)**: ${sachivalayams.length}
  - **Rural**: ${ruralCount}
  - **Urban**: ${urbanCount}

## Validation Summary
- **Duplicate Sachivalayam Codes**: ${duplicateCodes.length}
${duplicateCodes.length > 0 ? duplicateCodes.map(d => `  - Row ${d.row}: Code ${d.code} (${d.name})`).join('\n') : '  - None'}
- **Missing Required Values**: ${missingValuesList.length}
${missingValuesList.length > 0 ? missingValuesList.map(m => `  - Row ${m.row}: ${m.details}`).join('\n') : '  - None'}
- **Hierarchy/Business Violations**: ${validationErrors.length}
${validationErrors.length > 0 ? validationErrors.map(e => `  - Row ${e.row}: ${e.details}`).join('\n') : '  - None'}
`;

  fs.writeFileSync(path.join(REPORTS_DIR, 'kurnool-master-data-report.md'), reportContent);
  fs.writeFileSync(path.join(__dirname, '../docs/AP-Kurnool-Master-Data-Validation-Report.md'), reportContent);

  console.log(`✅ Reports written to docs/import-reports/kurnool-master-data-report.md and docs/AP-Kurnool-Master-Data-Validation-Report.md`);
}

runImport();
