// Patch the Gmail "dark spot" fix into a Resend template's HTML via the Resend API.
//
// Usage (key is loaded from .env by Node — never printed, never seen):
//   node --env-file=.env scripts/patch-resend-template.mjs <templateId>            # dry run (no changes)
//   node --env-file=.env scripts/patch-resend-template.mjs <templateId> --apply    # update the template draft
//
// Requires RESEND_API_KEY in a gitignored .env file at the project root.
import { Resend } from 'resend'
import { writeFileSync } from 'node:fs'

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const id = args.find((a) => !a.startsWith('--'))

if (!id) {
  console.error('Usage: node --env-file=.env scripts/patch-resend-template.mjs <templateId> [--apply]')
  process.exit(1)
}
if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY not set. Create a gitignored .env with RESEND_API_KEY=... and run with --env-file=.env')
  process.exit(1)
}

const resend = new Resend(process.env.RESEND_API_KEY)

// Rounded-card surface, inferred from the card's border (dark = none, cream = gold-ish, light = amber).
const surfaceByBorder = (border) =>
  /none/.test(border) ? '#161616' : /E8D4A6/i.test(border) ? '#FAF5E6' : /F7BE62/i.test(border) ? '#FFFFFF' : '#161616'

/** Apply the same fix the tool now bakes in: back the card, and paint each module cell via bgcolor. */
function patchDarkSpots(html) {
  let cardFills = 0
  let cellFills = 0
  // 1) Give the rounded card wrapper a surface background so no gap shows the page behind it.
  let out = html.replace(/<div style="(border-radius:24px;overflow:hidden;border:([^;"]+);?)">/g, (m, style, border) => {
    if (/background-color/.test(style)) return m
    cardFills++
    return `<div style="background-color:${surfaceByBorder(border)};${style}">`
  })
  // 2) Add a bgcolor attribute to every module table and its cell (Gmail paints cell bgcolor reliably).
  out = out.replace(
    /(<table[^>]*?)\sstyle="background-color:(#[0-9A-Fa-f]{6});([^"]*)"><tr><td(\s[^>]*?)?>/g,
    (m, tablePre, hex, tableRest, tdAttrs) => {
      if (/bgcolor=/i.test(tablePre)) return m // already patched — stay idempotent
      cellFills++
      return `${tablePre} bgcolor="${hex}" style="background-color:${hex};${tableRest}"><tr><td bgcolor="${hex}"${tdAttrs || ''}>`
    },
  )
  return { out, cardFills, cellFills }
}

const got = await resend.templates.get(id)
if (got.error) {
  console.error('Get failed:', got.error.message || got.error)
  process.exit(1)
}
const original = got.data.html || ''
const { out, cardFills, cellFills } = patchDarkSpots(original)

console.log(`Template : ${got.data.name} (${id})`)
console.log(`Card backgrounds added     : ${cardFills}`)
console.log(`Cell bgcolor attrs added   : ${cellFills}`)
console.log(`HTML length ${original.length} -> ${out.length}`)

if (out === original) {
  console.log('No changes needed — already patched.')
  process.exit(0)
}

const outFile = `.resend-${id}.patched.html`
writeFileSync(outFile, out)
console.log(`Patched HTML written to ${outFile} for review.`)

if (!apply) {
  console.log('\nDRY RUN — nothing was sent to Resend. Re-run with --apply to update the template.')
  process.exit(0)
}

const upd = await resend.templates.update(id, { html: out })
if (upd.error) {
  console.error('Update failed:', upd.error.message || upd.error)
  process.exit(1)
}
console.log('\nUpdated the template in Resend. Review it in the dashboard and Publish to go live (templates are versioned).')
