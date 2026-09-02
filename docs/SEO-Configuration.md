# e-Bhoomi SEO Configuration

## 1. Global Metadata (`app/layout.tsx`)
Configured robust defaults for the entire application:
- **Title Template**: `%s | e-Bhoomi` (e.g., "Public Land Search | e-Bhoomi").
- **Description**: Highly descriptive text about the AI-assisted land record digitization platform.
- **Keywords**: Search-friendly terms like "Land Records", "Digitization", "Government of India".
- **Authorship**: Explicitly attributed to the Department of Land Resources and Ministry of Rural Development.
- **OpenGraph & Twitter**: Configured standard OpenGraph metadata to render rich previews when links are shared on social platforms or messaging apps.

## 2. Favicon Setup
- Removed the default Vercel favicon and starter assets.
- Set the `icons` property in Next.js metadata to reference `public/assets/e-bhoomi-logo.svg`.
- Added support for standard browsers and Apple touch icons.

## 3. Sitemap & Robots
- **Sitemap**: A dynamic `sitemap.ts` configuration exposes public-facing pages (`/` and `/login`) with appropriate change frequencies and priorities.
- **Robots.txt**: A dynamic `robots.ts` restricts search crawlers from accessing sensitive internal routes, ensuring privacy for:
  - `/admin/`
  - `/officer/`
  - `/auth/`
  - `/internal/`
  - `/api/`
  - `/mro/`
  - `/rdo/`
