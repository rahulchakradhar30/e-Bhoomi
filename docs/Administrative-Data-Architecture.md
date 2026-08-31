# e-Bhoomi Authoritative Administrative Data Architecture

## Overview
e-Bhoomi uses Local Government Directory (LGD) seed metadata from the Ministry of Panchayati Raj, Government of India.
**SIH MVP Active Scope**: Andhra Pradesh — Kurnool District (State LGD: `28`, District LGD: `545`).
*Architecture is designed for future multi-state expansion via state configuration.*

---

## 1. Master Data Layer Structure (`src/data/administrative/`)
- `master-metadata.json`: Dataset metadata snapshot (LGD Version 2026.1).
- `andhra-pradesh/state.json`: Active State LGD metadata (`28` for Andhra Pradesh).
- `andhra-pradesh/kurnool/district.json`: LGD district codes, names, local names, display codes.
- `andhra-pradesh/kurnool/revenue-divisions.json`: Kurnool Revenue Divisions (Kurnool, Adoni, Pattikonda).
- `andhra-pradesh/kurnool/mandals.json`: Kurnool Mandal codes and administrative types.
- `andhra-pradesh/kurnool/villages.json`: Revenue village codes mapped to Kurnool mandals.

---

## 2. Administrative Data Service Boundary (`src/services/administrativeDataService.ts`)
- Type-safe access to administrative locations.
- Provides search, filtering by division/mandal, and LGD code resolution.
- Centralized `APP_CONFIG` controls active state/district defaults (`AP` / `KURNOOL`).
