# Get Access — Email Studio

A modular email builder for the Get Access marketing team. Emails are composed from
pre-designed **modules** (each with variations and editable slots); brand colors,
type and spacing are locked so every email stays on-brand by construction.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## How it works

- **Home** — the library. Three tabs: *Marketing emails*, *Transactional emails*
  and *Modules*. Templates are saved automatically in the browser (localStorage).
- **Builder** — click a template (or "Create a template") to open it. Add modules
  from the left palette, click a block on the canvas to edit its content and switch
  its variation on the right, reorder/duplicate/remove with the hover tools.
  Desktop/mobile preview toggle in the top bar.
- **Export** — "Export HTML" downloads a self-contained, email-safe HTML file
  (tables + inline styles). Individual modules can be exported on their own, both
  from the Modules tab and from the builder inspector.
- **Merge tags** — text like `{{first_name}}` passes through export untouched, so
  transactional templates work with any ESP's variable syntax.

## Architecture

```
src/
  types.ts               ModuleDef / ModuleInstance / EmailTemplate
  lib/brand.ts           LOCKED brand constants (from the brand SVG package)
  lib/exportHtml.ts      email-safe HTML rendering + download
  modules/registry.ts    the module library  ← Figma modules land here
  store.tsx              templates state + localStorage persistence
  pages/Home.tsx         gallery with the three tabs
  pages/Builder.tsx      palette / canvas / inspector
```

A module is: `slots` (what editors can change — text, images, links),
`variants` (the layout variations from Figma) and `toHtml()` — a single
source of truth used for both the canvas preview and the exported file,
so what you see is exactly what ships.

## Modules (extracted from Figma)

Source: **DS - Get Access Foundation** → *Emails* → *RawComponents*.
Every module supports three surface themes — **Dark / Cream / Light** — switchable
per module or for the whole email at once (top bar in the builder).

**Shared** (transactional + marketing): Logo heading · Heading (default / eyebrow) ·
Body (plain / with link) · List (bullet / numbered) · Verification code ·
Secondary note · Spacer (4–24px) · Divider · Buttons (primary / secondary / pair) ·
Callout (regular / link) · Image (inset / full width) · Footer · Disclosure.

**Marketing-only**: Feature card (image left / right) · Banner CTA (Cream / Dark /
Turquoise / Emerald / Sapphire cards) · Numbered card and Highlight item (Sapphire /
Emerald / Turquoise accents, surface-aware). Hero-style openers are composed from
Logo heading + full-width Image + centered Heading.

Typography per the design system: **Arial** for all content (32px headings,
16px body), **Schibsted Grotesk Medium** for buttons. Primary buttons carry the
gold gradient `#DFC8A1 → #F6E6CA` on dark, solid ink on light surfaces.

Production notes: the logo is embedded as an SVG data URI — swap `logoDataUri()`
for a hosted PNG before real sends (Outlook does not render SVG). The Hero uses a
CSS background image, which Outlook desktop also ignores (it falls back to the
theme color).
