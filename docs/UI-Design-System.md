# e-Bhoomi Official Government of India Web Design System

## Overview
The e-Bhoomi design system preserves official Government of India visual identity guidelines.

---

## 1. Color Palette & Tokens
- **Navy Primary (`--goi-navy`)**: `#0B2545` (Contextual Headers, Top Utility Bar, Primary Accents, Headings)
- **Blue Action (`--goi-blue`)**: `#003366` (Primary Action Buttons, Active Navigation Links)
- **Blue Hover (`--goi-blue-hover`)**: `#002244` (Button Hover State)
- **Green Accent (`--goi-green`)**: `#0b6623` (Approved Status Badges & Flags)
- **Saffron Tricolor Accent (`--goi-saffron`)**: `#FF9933` (Flag Strip & Active Tab Indicator)
- **Background Main (`--bg-main`)**: `#FFFFFF` (Surface Panels & Cards)
- **Background Subtle (`--bg-subtle`)**: `#F8FAFC` (Portal Main Content Surface)
- **Text Primary (`--text-primary`)**: `#0F172A` (Body Copy)
- **Text Secondary (`--text-secondary`)**: `#475569` (Subtitles & Form Guidance)
- **Borders (`--border-color`)**: `#CBD5E1` (Restrained Card & Table Grid Borders)

---

## 2. Typography
- **Primary Font**: `Inter`, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif.
- **Base Headings**: `h1`, `h2`, `h3` bold font-weight 800 in navy palette.

---

## 3. Preserved Vector SVG Branding
- `/public/assets/department-of-land-resources.svg`
- `/public/assets/ministry-of-rural-development.svg`
- `/public/assets/e-bhoomi-logo.svg`

Vector aspect ratios, native inline resolution, and color fidelity are strictly maintained across desktop, tablet, and mobile displays.

---

## 4. UI Layout & Viewport Standards
- Full-bleed portal container without artificial container width caps (`width: 100%`, `max-width: 1280px` inner alignment).
- Internal viewport scrolling for internal workspace panels.
- Sticky bottom action bar (`StickyActionBar.tsx`) for primary workflow steps.
