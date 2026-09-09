# e-Bhoomi — Global Responsive Design Architecture

## 1. Overview & Principles
The **e-Bhoomi** portal employs a unified responsive engineering architecture designed to provide consistent, official government portal aesthetics across all devices and viewport dimensions:
- Small mobile phones (320px–360px)
- Standard mobile phones (375px–414px)
- Large mobile / Phablets (480px–640px)
- Tablets in Portrait (768px–820px)
- Tablets in Landscape & Small Laptops (1024px–1200px)
- Standard Laptops & Desktops (1280px–1440px)
- Large Desktop Monitors (1920px+)

### Strict Architectural Principles
1. **Single Codebase**: One unified UI structure adapted cleanly using CSS Grid, Flexbox, and CSS Media Queries without device sniffing or duplicate mobile pages.
2. **Zero Document-Level Horizontal Overflow**: Full containment of horizontal table and matrix data within dedicated responsive wrappers (`.table-responsive-wrapper`).
3. **Preservation of Visual Identity**: 100% fidelity to the approved Government of India land resource design language, tricolor bars, typography hierarchy, and status color tokens.
4. **Touch-Friendly Controls**: Minimum touch target sizing (>= 40px) and touch-safe input sizing (16px minimum font size) to prevent mobile browser auto-zoom.

---

## 2. Global Breakpoint Matrix

| Viewport Tier | Width Range | Layout Behavior & Grid Adjustments |
| :--- | :--- | :--- |
| **Large Desktop / 4K** | >= 1440px | Centered `1280px` or `1400px` max-width container, full multi-column dashboard & dual-pane workspace. |
| **Standard Laptop** | 1280px - 1439px | 4-column summary metric cards, 3-column master data hierarchy, standard spacing. |
| **Tablet Landscape / Small Laptop** | 1024px - 1279px | 3-column summary cards, 2-column master data grid, stacked operational split panels. |
| **Tablet Portrait / Phablet** | 768px - 1023px | 2-column summary cards, 1-column forms, stacked dual-pane digitization workspace, fluid header. |
| **Mobile Standard** | 480px - 767px | 1-column forms, 1-to-2 column metric cards, stacked action buttons, internal table scroll. |
| **Mobile Compact** | 360px - 479px | Compact brand logos, stacked utility bar, full-width touch buttons, safe 0.75rem side padding. |
| **Mobile Ultra-Small** | 320px - 359px | Scaled micro-logos, vertical user badge, condensed stepper labels, no clipped actions. |

---

## 3. Core Component Responsiveness

### A. Global Layout & Containers
- `.ebhoomi-full-portal-layout`: Uses `min-height: 100dvh` to seamlessly handle dynamic mobile address bar heights without jumpy reflows.
- `.content-container`: Fluid padding using `clamp(0.75rem, 3vw, 1.5rem)` ensuring no content touches screen edges while maximizing usable canvas.

### B. Headers & Utility Navigation
- `.top-utility-bar`: Reflows to a centered, compact flex column on mobile screens < 480px.
- `.header-left-brands`: Dynamically scales the 3 Department / Ministry / e-Bhoomi logos with responsive `max-width` and fluid height rules down to 320px screens without clipping or wrapping.
- `.contextual-app-header-strip` & `TopBar`: Preserves role-specific context (Admin, State Officer, Collector, RDO, MRO, VRO) while wrapping badge actions into touch-friendly buttons on mobile.

### C. Officer Navigation (`Sidebar`)
- `.officer-nav-bar`: Sticky horizontal scrolling navigation bar with `-webkit-overflow-scrolling: touch`, subtle scrollbars, and active indicator underlines that preserve full touch accessibility on all viewports.

### D. Dashboards
- Summary metric cards (`.summary-cards-grid`): Transition smoothly from 5 columns on desktop -> 4 on laptops -> 3 on tablet landscape -> 2 on tablet portrait -> 1 on mobile phones.
- Operational split panels (`.operational-split-grid`): Automatically stack vertically on tablet and mobile viewports.

### E. Land Record Tables & Data Browsers
- `.table-responsive-wrapper`: Ensures 100% self-contained horizontal scrolling with sticky headers and responsive cell padding.
- Filter and search bars (`OfficerDirectoryTable`, `MasterDataBrowser`) wrap fluidly without fixed-pixel breakages.

### F. Land Digitization Workspace
- Dual Pane Grid (`.digi-workspace-grid`): Displays side-by-side on desktop (>= 1024px) and reflows into a single vertical stream (Document -> Verification Checklist -> Extracted Fields -> Actions) on tablet and mobile.
- Sticky Action Bar (`.digi-action-bar`): Stacks vertically on mobile with full-width touch buttons ("Previous Phase", "Save Draft", "Proceed / Submit").
- Interactive 8-Step Stepper (`.digi-stepper-container`): Smooth horizontal scrolling with touch support on narrow viewports.

### G. Public Land Search
- Location cascade dropdowns stack from 2 columns on desktop to 1 column on mobile.
- Survey number selection chips wrap fluidly with comfortable touch padding.
- Record detail inspection modal displays in a centered, responsive card with safe viewport padding and internal vertical scrolling.

---

## 4. Verification & Testing Matrix

The implementation has been verified across the following standard test viewports:
- `320 x 568` (iPhone SE 1st Gen)
- `375 x 667` (iPhone SE 2nd/3rd Gen)
- `390 x 844` (iPhone 12/13/14)
- `414 x 896` (iPhone XR / 11)
- `480 x 800` (Large Android Phone)
- `768 x 1024` (iPad Portrait)
- `820 x 1180` (iPad Air Portrait)
- `1024 x 768` (iPad Landscape)
- `1280 x 800` (Small Laptop)
- `1366 x 768` (Standard Laptop)
- `1440 x 900` (Desktop Monitor)
- `1920 x 1080` (Full HD Desktop)
