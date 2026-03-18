# EFFFEKT Backlog

## Clean Selling Improvements (March 2026)

### Done
- [x] **Integration marquee** — Two-row text marquee, opposite scroll directions, fade-masked edges, hover pause
- [x] **Trust signals near CTAs** — Subtle "Ingen bindingstid · Svar innen 24t" below hero CTA + contact form
- [x] **CTA copy updated** — "Ta kontakt" → "Book en gratis prat" / "Snakk med oss" across all pages
- [x] **Pricing visible on service pages** — "Fra kr X" in body text on /nettside, /integrasjon, /ai, /system
- [x] **Homepage section reorder** — Marquee between Hero and Products
- [x] **Floating CTA softened** — "Book demo" → "Snakk med oss"

### Remaining
- [ ] **Embed proof lines in service cards** — Expand service-proof pattern to all 3 cards in Products
- [ ] **Add more testimonials** — Content task, need real client quotes
- [ ] **Replace vision illustrations** — Consider swapping iconbg1/2.webp with real project screenshots
- [ ] **Categorized integration grid** — Detailed integration categories on /integrasjon page
- [ ] **SVG logos for marquee** — Currently text-based (clean), swap to brand SVGs when available

## Design / Rebrand

- [x] ~~Redesign header~~ — Simplified to transparent→scrolled pattern
- [x] ~~Fix footer background~~ — Now uses bg-dark/bg-light SVG background
- [ ] **Simplify page content** — Less content, simpler and more focused messaging

## Performance

- [ ] **Optimize background SVGs** — `bg-dark.svg` (2.39 MB) and `bg-light.svg` (2.40 MB) are very large
- [ ] **Delete or optimize `hero-bg.jpg`** — 5.48 MB, likely unused

## Cleanup

- [ ] **Remove unused michael.jpg** — Both `public/assets/` and `src/assets/` copies
- [ ] **Hardcoded confetti colors** — Should reference palette variables (`Contact.astro:116`)

## Previously Completed

- [x] ~~Hero placeholder text~~ — Replaced with proper Norwegian copy
- [x] ~~Delete `nul` file~~ — Removed Windows artifact
- [x] ~~Stale email CC~~ — Removed `michael@efffekt.no`
- [x] ~~Hardcoded font preload hashes~~ — Removed brittle preload links
- [x] ~~Duplicate icon~~ — Changed second `gift` to `check-circle` in `system.astro`
- [x] ~~Missing `aria-expanded`~~ — Added to FAQ buttons
- [x] ~~Stale "MIDLERTIDIG SKJULT" comments~~ — Removed
- [x] ~~Dynamic copyright year~~ — Footer now uses `new Date().getFullYear()`
- [x] ~~Hardcoded colors in Hero~~ — Now uses CSS variables
