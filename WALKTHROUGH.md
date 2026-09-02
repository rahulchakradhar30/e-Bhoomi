# Typography Update Walkthrough

This document outlines the typography changes made to the eBhoomi project to align with the Government of India Digital Brand Identity Manual.

## Typography Changes
- **Primary Font**: `Noto Sans` (Replaced `Inter`)
- **Heading Font**: `Noto Sans Display` (Used for `h1`-`h6` elements)
- **Regional Languages Support**: Added explicit imports and fallback priority for `Noto Sans Telugu` and `Noto Sans Kannada`.

## Files Modified

1. **`app/layout.tsx`**
   - Added Google Fonts `<link>` tags in the HTML `<head>` section to globally import the Noto Sans family, ensuring `display=swap` for performance and minimizing FOIT.
   - Removed any dependency on Next.js default font optimization that may strip necessary Indian regional glyphs.

2. **`app/globals.css`** & **`src/styles/index.css`**
   - Removed the legacy `@import` directive for the `Inter` font.
   - Updated the `--font-sans` CSS variable to:
     ```css
     'Noto Sans', 'Noto Sans Telugu', 'Noto Sans Kannada', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
     ```
   - Introduced a new `--font-display` CSS variable for headings:
     ```css
     'Noto Sans Display', 'Noto Sans Telugu', 'Noto Sans Kannada', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
     ```
   - Updated all base heading selectors (`h1`, `h2`, `h3`, `h4`, `h5`, `h6`) to use `--font-display`.
   - Globally replaced all instances of `font-weight: 800` with `font-weight: 700` as 800 is not supported/loaded by the new typography stack and 700 is the official bold weight.

## Font Weights Used
- **400** (Regular)
- **500** (Medium)
- **600** (Semi-Bold)
- **700** (Bold)

## Verification Performed
- Confirmed the removal of all `Inter` references within the web codebase.
- Verified that `font-weight: 800` was downgraded to `700` correctly across both `globals.css` and `index.css`.
- Ensured CSS syntax validity and absence of conflicting font definitions.
