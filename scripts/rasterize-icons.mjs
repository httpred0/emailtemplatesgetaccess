// Rasterize the icon-card icons (SVG -> PNG) for the full color matrix the app can emit.
// Proves that "hosted icons" needs NO backend: it's a fixed set of small static files.
// Run: node scripts/rasterize-icons.mjs
import { Resvg } from '@resvg/resvg-js'
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const iconsDir = join(root, 'src', 'assets', 'icons')
const out = join(root, 'public', 'brand', 'icons')
mkdirSync(out, { recursive: true })

// Source strokes/fills are authored in this token and recolored at render time (see lib/icons.ts).
const TOKEN = /#ECD4AB/gi

// The complete set of colors the Icon card can paint an icon.
// Source of truth: brand.ts ACCENTS[*].dark.main + the cream/light surface knockouts (registry.ts).
// On dark the icon takes the bright accent; on cream/light the accent moves to the badge fill and
// the icon is knocked out to the surface, so the deepened light tones are never used on the icon.
const COLORS = {
  // bright accent (dark surface)
  sapphire: '#2DAEDE', emerald: '#B2DF99', turquoise: '#47CCBF', amber: '#F27E49',
  gold: '#F7BE62', amethyst: '#8F7997', salmon: '#FF717F', chili: '#E53622',
  // near-white knockouts (cream/light surface + their card bg for outline variants)
  'surface-cream': '#F5F0E1', 'bg-cream': '#FAF5E6',
  'surface-light': '#F5F5F2', 'bg-light': '#FFFFFF',
}

const iconFiles = readdirSync(iconsDir).filter((f) => f.endsWith('.svg'))
let count = 0
let bytes = 0
for (const file of iconFiles) {
  const id = file.replace('.svg', '').toLowerCase()
  const svg = readFileSync(join(iconsDir, file), 'utf8')
  for (const [key, hex] of Object.entries(COLORS)) {
    const colored = svg.replace(TOKEN, hex)
    // Render at 88px (4x the 22px display box) for retina crispness.
    const png = new Resvg(colored, { fitTo: { mode: 'width', value: 88 } }).render().asPng()
    writeFileSync(join(out, `${id}__${key}.png`), png)
    count++
    bytes += png.length
  }
}
console.log(`${iconFiles.length} icons x ${Object.keys(COLORS).length} colors = ${count} PNGs, ${(bytes / 1024 / 1024).toFixed(2)} MB total`)
