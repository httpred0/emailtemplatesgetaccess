# Get Access — Email Studio

A modular email builder for the Get Access marketing team. Emails are composed from
pre-designed **modules** (each with layout variations and editable slots); brand
colors, type and spacing are locked so every email stays on-brand by construction.
Marketing emails ship via **HubSpot**, transactional via **Resend** — the studio
produces the HTML for both.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## How it works

- **Home** — the library. Three tabs: *Marketing*, *Transactional* and *Modules*
  (the full design-system listing, each module rendered at real 600px size with
  variation, color and per-module export controls).
- **Builder** — open a template to edit. Add modules from the left palette, click
  a block on the canvas to edit its content, variation and surface color on the
  right, reorder/duplicate/remove with the hover tools. Theme switcher
  (Dark / Cream / Light) recolors the whole email; Desktop/Mobile preview toggle.
- **Export** — *Copy HTML* puts the email on the clipboard (paste into
  HubSpot/Resend); *Export HTML* downloads a self-contained, email-safe file
  (tables + inline styles). Individual modules export on their own too.
- **Merge tags** — text like `{{first_name}}` or `{{reset_url}}` passes through
  export untouched; rename to your ESP's syntax if it differs.
- **Saving** — every edit autosaves to the browser (localStorage). To promote the
  current library to the project's committed defaults, POST it to the dev-only
  `/__save-seeds` endpoint (see `vite.config.ts`) — it rewrites
  `src/data/seed-templates.json`, which seeds fresh browsers.

## Before sending (images)

Most inboxes (Gmail, Outlook) **block embedded images** — uploads, placeholders
and data URIs. Host images online (HubSpot and Resend both host files) and paste
the https URL into the image fields. The builder shows this reminder and the
export warns when embedded images are detected. The logo is currently an embedded
SVG too — swap `logoDataUri()` / `markDataUri()` in `src/lib/brand.ts` for hosted
PNG URLs before production sends.

## Architecture

```
src/
  types.ts                    ModuleDef / ModuleInstance / EmailTemplate
  lib/brand.ts                LOCKED brand constants, themes, accents, logo assets
  lib/exportHtml.ts           email-safe HTML rendering, rounded card shell, download
  modules/registry.ts         the module library (extracted 1:1 from Figma)
  data/seed-templates.json    committed template library (seeds fresh browsers)
  store.tsx                   templates state + localStorage persistence + migrations
  pages/Home.tsx              gallery with the three tabs
  pages/Builder.tsx           palette / canvas / inspector
```

A module is: `slots` (what editors can change — text, images, links),
`variants` (the layout variations from Figma) and `toHtml()` — a single source
of truth used for the canvas preview, the gallery thumbnails and the exported
file, so what you see is exactly what ships.

## Modules (extracted from Figma)

Source: **DS - Get Access Foundation** → *Emails* → *RawComponents*.
Every module supports three surface themes — **Dark / Cream / Light** —
switchable per module or for the whole email at once.

**Shared** (transactional + marketing): Logo heading (centered / left) ·
Heading (default / eyebrow / centered variants) · Body (plain / link / centered
variants) · List (bullet / numbered) · Verification code (left / centered) ·
Secondary note (left / centered) · Spacer (4–24px) · Divider · Buttons
(primary / secondary / pair, each left or centered) · Callout (regular / link,
accent left bar) · Image (inset / full width) · Footer · Disclosure (transparent,
sits outside the rounded email card).

**Marketing-only**: Feature card (image left / right, image fills card height) ·
Banner CTA (Cream / Dark / Turquoise / Emerald / Sapphire cards) · Numbered card
(accent glow per Figma) and Highlight item — accents are surface-aware
(bright tones on dark, deeper tones on cream/light for contrast).

Typography per the design system: **Arial everywhere** (32px headings, 16px body,
buttons included). Primary buttons carry the gold gradient `#DFC8A1 → #F6E6CA`
on dark, solid ink on light surfaces. The email content sits in a 24px-radius
card on a theme-colored page (`#0D0D0D` dark / `#E4DDD1` cream / gradient light);
the card is stroked `#E8D4A6` on cream and `#F7BE62` on light, borderless on dark.
Outlook desktop degrades gracefully (square corners, flat colors, no background
images).
