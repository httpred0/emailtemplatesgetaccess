// Rasterize the fixed brand logos (SVG -> PNG) for email hosting.
// Outlook and several webmail clients won't render SVG <img>; PNG is the safe format.
// Run: node scripts/rasterize-brand.mjs
import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = (p) => join(root, 'src', 'assets', p)
const out = join(root, 'public', 'brand')
mkdirSync(out, { recursive: true })

// gold -> ink: swap the gradient fills for solid brand ink, mirroring logoDataUri() in brand.ts
const toInk = (svg) => svg.replace(/fill="url\(#paint[^"]*\)"/g, 'fill="#161616"')

const lockup = readFileSync(src('logo-lockup.svg'), 'utf8')
const markGold = readFileSync(src('logomark-gold.svg'), 'utf8')
const markInk = readFileSync(src('logomark-dark.svg'), 'utf8')

// Render at ~4x the intended display size so it stays crisp on retina screens.
const jobs = [
  { name: 'logo-lockup-gold.png', svg: lockup, h: 96 },
  { name: 'logo-lockup-ink.png', svg: toInk(lockup), h: 96 },
  { name: 'logomark-gold.png', svg: markGold, h: 112 },
  { name: 'logomark-ink.png', svg: markInk, h: 112 },
]

for (const j of jobs) {
  const png = new Resvg(j.svg, { fitTo: { mode: 'height', value: j.h } }).render()
  const buf = png.asPng()
  writeFileSync(join(out, j.name), buf)
  console.log(`${j.name.padEnd(24)} ${png.width}x${png.height}  ${(buf.length / 1024).toFixed(1)} KB`)
}
