# AP Kurnool Excel Inspection Report

This document records the structure, fields, and hierarchy parsed from the authoritative input master data workbook:
`R:\e-BhoomiDATA\AP_Kurnool_Sachivalayam_Master_Online_Import.xlsx`

---

## 1. File Metadata & Extensions
- **File Checked**: `R:\e-BhoomiDATA\AP_Kurnool_Sachivalayam_Master_Online_Import.xlsx`
- **File Type**: Excel Workbook (Office Open XML Spreadsheet format `.xlsx`)
- **File Access**: Successfully read using the Node `xlsx` package.

---

## 2. Worksheet Summaries

### Worksheet 1: `Kurnool Master`
- **JSON Row Count**: 77 rows (excluding header)
- **Column Count**: 9 columns
- **Fields Detected**:
  - `District`
  - `District Code`
  - `Revenue Division`
  - `Mandal`
  - `Mandal Code`
  - `Area Type`
  - `Village / Town / Ward`
  - `Sachivalayam Name`
  - `Sachivalayam Code`

### Worksheet 2: `Status`
- **JSON Row Count**: 7 rows
- **Columns**: `Item`, `Value`
- **Purpose**: Metadata details indicating that this list is a GSWS-derived subset for Kurnool district.

---

## 3. Hierarchy & Geographic Discovery
- **State**: Andhra Pradesh (Implicit, LGD state code `28`)
- **District**: `Kurnool` (Authoritative code `511` from workbook)
- **Revenue Division**: `Adoni`
- **Mandal**: `Adoni` (Authoritative code `5271` from workbook)
- **Area Types**: `Rural` (Gram Sachivalayam) and `Urban` (Ward Sachivalayam)
- **Villages/Wards**: The column `Village / Town / Ward` is **100% blank (77 out of 77 rows)**.
- **Sachivalayams**: 77 unique Sachivalayam units with corresponding names and codes (no duplicate names or codes).

---

## 4. Key Limitations & Design Implications
1. **Empty Village Column**: Because the `Village / Town / Ward` column is entirely empty, the Sachivalayams themselves represent the leaf nodes of the administrative hierarchy under Mandal `Adoni`.
2. **Kurnool Code Difference**: The workbook specifies district code `511` (different from general LGD code `545`). The database must use `511` as the source code to maintain integrity with this workbook.
3. **Mandal Subset**: Only `Adoni` mandal is represented in the master dataset. No other mandals or revenue divisions of Kurnool are present.
