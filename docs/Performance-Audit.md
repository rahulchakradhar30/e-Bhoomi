# e-Bhoomi Performance & SEO Audit

## 1. Next.js SEO & Metadata
- **Issue**: Missing comprehensive SEO metadata in `app/layout.tsx` (OpenGraph, robots, canonical URL, icons).
- **Affected file**: `app/layout.tsx`
- **Severity**: High
- **Cause**: Project uses default or minimal Next.js metadata.
- **Proposed fix**: Define a robust `Metadata` object in `layout.tsx` with `metadataBase`, `title` templates, `openGraph`, `robots`, and `icons`.
- **Expected improvement**: Proper indexing, better social sharing, clear application identity.
- **UI/UX risk**: None.

## 2. Favicon Configuration (Vercel Branding)
- **Issue**: Vercel default favicon (`public/favicon.svg` / `public/icons.svg`) is present.
- **Affected file**: `public/favicon.svg`, `public/icons.svg`, `app/layout.tsx`
- **Severity**: High
- **Cause**: Leftover Next.js starter assets.
- **Proposed fix**: Delete `favicon.svg` and `icons.svg`. Add `icons` property to `layout.tsx` pointing to `/assets/e-bhoomi-logo.svg`.
- **Expected improvement**: Correct e-Bhoomi branding across browser tabs and bookmarks.
- **UI/UX risk**: None.

## 3. Sitemap & Robots.txt
- **Issue**: Missing `sitemap.ts` and `robots.ts` preventing proper crawler indexing.
- **Affected file**: `app/sitemap.ts`, `app/robots.ts`
- **Severity**: Medium
- **Cause**: Not yet implemented.
- **Proposed fix**: Create dynamic or static Next.js sitemap/robots files that expose public routes and block internal/admin routes (`/admin`, `/officer`, `/auth`).
- **Expected improvement**: Search engine compliance and privacy protection for admin routes.
- **UI/UX risk**: None.

## 4. Public Search Performance (Repeated State & Renders)
- **Issue**: `PublicLandSearch.tsx` has many state variables triggering frequent re-renders when inputs change, and lacks error caching.
- **Affected file**: `src/components/ui/PublicLandSearch.tsx`
- **Severity**: Medium
- **Cause**: Lack of memoization for expensive cascading dropdown selections and search operations.
- **Proposed fix**: Use `useCallback` for event handlers, optimize conditional rendering, ensure loading states don't cause layout shift (e.g. reserve space for errors).
- **Expected improvement**: Smoother dropdown interactions and reduced client-side CPU usage.
- **UI/UX risk**: Low (only implementation changes).

## 5. Auth Loading Glitches
- **Issue**: Multiple loading labels flash sequentially in `OfficerLogin.tsx` ("Resolving...", "Authenticating...", "Loading officer profile...").
- **Affected file**: `src/components/forms/OfficerLogin.tsx`
- **Severity**: Low/Medium
- **Cause**: Sequential async tasks each update the loading state, causing text flicker.
- **Proposed fix**: Standardize the loading state string or debounce updates to prevent rapid flickering while keeping the user informed.
- **Expected improvement**: Smoother perceived login experience.
- **UI/UX risk**: Low.

## 6. Image & Asset Loading
- **Issue**: Heavy SVG assets (e.g. `e-bhoomi-logo.svg` is 9MB) might block rendering or slow down TTFB if not handled properly.
- **Affected file**: `public/assets/*`
- **Severity**: Medium
- **Cause**: Potentially unoptimized SVG exports containing base64 images or excessive paths.
- **Proposed fix**: Preload critical assets in Next.js or leverage `next/image` where appropriate (though for a 9MB SVG, using it as a favicon via standard `<link rel="icon">` will just trigger a browser fetch). We will ensure standard loading attributes (`priority`) are applied in components using it.
- **Expected improvement**: Faster LCP and reduced layout shifts.
- **UI/UX risk**: Low.
