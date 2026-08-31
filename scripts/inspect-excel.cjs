const xlsx = require('xlsx');
const fs = require('fs');

const filePath = 'R:\\e-BhoomiDATA\\Kurnool_District_Sachivalayam_Master_2025_500plus.xlsx';

try {
  console.log(`Opening Excel file: ${filePath}`);
  const workbook = xlsx.readFile(filePath);
  
  const sheetName = 'Kurnool Sachivalayams';
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { defval: '' });
  
  console.log(`--- Sheet: ${sheetName} ---`);
  console.log(`Total Rows: ${data.length}`);
  
  const districts = new Set();
  const districtCodes = new Set();
  const divisions = new Set();
  const mandals = new Set();
  const mandalCodes = new Set();
  const areaTypes = new Set();
  const localities = new Set();
  const sachNames = new Set();
  const sachCodes = new Set();
  
  const sachCodeMap = new Map();
  const missingFields = {};
  
  data.forEach((row, idx) => {
    Object.keys(row).forEach((col) => {
      const val = String(row[col]).trim();
      if (!val) {
        missingFields[col] = (missingFields[col] || 0) + 1;
      }
    });
    
    districts.add(row['District']);
    districtCodes.add(row['District Code']);
    divisions.add(row['Revenue Division']);
    mandals.add(row['Mandal']);
    mandalCodes.add(row['Mandal Code']);
    areaTypes.add(row['Area Type']);
    
    const loc = String(row['Village / Town / Ward']).trim();
    if (loc) localities.add(loc);
    
    const sName = String(row['Sachivalayam Name']).trim();
    const sCode = String(row['Sachivalayam Code']).trim();
    
    if (sName) sachNames.add(sName);
    if (sCode) {
      sachCodes.add(sCode);
      if (!sachCodeMap.has(sCode)) {
        sachCodeMap.set(sCode, []);
      }
      sachCodeMap.get(sCode).push({ row: idx + 2, name: sName, mandal: row['Mandal'] });
    }
  });
  
  console.log('Unique Districts:', Array.from(districts));
  console.log('Unique District Codes:', Array.from(districtCodes));
  console.log('Unique Divisions:', Array.from(divisions));
  console.log('Unique Mandals Count:', mandals.size);
  console.log('Unique Mandals:', Array.from(mandals));
  console.log('Unique Area Types:', Array.from(areaTypes));
  console.log('Unique Localities Count:', localities.size);
  console.log('Unique Sachivalayam Names Count:', sachNames.size);
  console.log('Unique Sachivalayam Codes Count:', sachCodes.size);
  
  const duplicates = [];
  for (const [code, occurrences] of sachCodeMap.entries()) {
    if (occurrences.length > 1) {
      duplicates.push({ code, occurrences });
    }
  }
  
  console.log(`Duplicate Sachivalayam Codes: ${duplicates.length}`);
  if (duplicates.length > 0) {
    console.log(JSON.stringify(duplicates, null, 2));
  }
  
  console.log('Missing/Blank values per column:', missingFields);
  
  // Read summary sheet
  console.log('\n--- Summary Sheet ---');
  const sumSheet = workbook.Sheets['Summary'];
  const sumData = xlsx.utils.sheet_to_json(sumSheet);
  console.log(JSON.stringify(sumData, null, 2));
  
} catch (error) {
  console.error('Error inspecting workbook:', error);
}
