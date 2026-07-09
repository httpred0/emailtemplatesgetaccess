import { EmailTemplate, ModuleInstance } from '../types'
import { moduleById } from '../modules/registry'
import { ThemeId, escapeHtml } from './brand'

/** Outer canvas behind the 600px email card, per theme. `solid` is the Outlook/bgcolor fallback. */
const OUTER_BG: Record<ThemeId, { css: string; solid: string }> = {
  dark: { css: '#0D0D0D', solid: '#0D0D0D' },
  cream: { css: '#E4DDD1', solid: '#E4DDD1' },
  light: { css: 'linear-gradient(80deg, #F4F4F2 50.64%, #F8F8ED 140.84%)', solid: '#F4F4F2' },
}

/** Light theme frames the card with the brand amber. */
const CARD_BORDER: Record<ThemeId, string> = {
  dark: 'none',
  cream: 'none',
  light: '1px solid #F7BE62',
}

export function renderModuleBlock(inst: ModuleInstance): string {
  const mod = moduleById(inst.moduleId)
  if (!mod) return `<!-- unknown module: ${inst.moduleId} -->`
  const values = { ...Object.fromEntries(mod.slots.map((s) => [s.key, s.default])), ...inst.values }
  return mod.toHtml(values, inst.variantId, inst.color ?? 'dark')
}

/** The disclosure sits OUTSIDE the rounded email card, on the page background. */
export function splitModules(modules: ModuleInstance[]): { card: ModuleInstance[]; tail: ModuleInstance[] } {
  return {
    card: modules.filter((m) => m.moduleId !== 'disclosure'),
    tail: modules.filter((m) => m.moduleId === 'disclosure'),
  }
}

export const CARD_RADIUS = 24

const roundedCard = (inner: string, theme: ThemeId) =>
  inner
    ? `<div style="border-radius:${CARD_RADIUS}px;overflow:hidden;border:${CARD_BORDER[theme]};">\n${inner}\n</div>`
    : ''

function emailShell(title: string, preheader: string, theme: ThemeId, bodyBlocks: string): string {
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:${OUTER_BG[theme].solid};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${OUTER_BG[theme].solid}" style="background:${OUTER_BG[theme].css};">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;">
          <tr>
            <td style="padding:0;">
${bodyBlocks}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function renderEmailHtml(t: EmailTemplate): string {
  const theme = t.theme ?? 'dark'
  const { card, tail } = splitModules(t.modules)
  const blocks = `${roundedCard(card.map(renderModuleBlock).join('\n'), theme)}\n${tail.map(renderModuleBlock).join('\n')}`
  return emailShell(t.subject || t.name, t.preheader, theme, blocks)
}

export function renderSingleModuleHtml(inst: ModuleInstance, name: string): string {
  const theme = inst.color ?? 'dark'
  const block = inst.moduleId === 'disclosure' ? renderModuleBlock(inst) : roundedCard(renderModuleBlock(inst), theme)
  return emailShell(name, '', theme, block)
}

/** Bare-canvas markup for gallery thumbnails (no <html> wrapper). */
export function renderCanvasHtml(t: EmailTemplate): string {
  const theme = t.theme ?? 'dark'
  const { card, tail } = splitModules(t.modules)
  return `${roundedCard(card.map(renderModuleBlock).join('\n'), theme)}\n${tail.map(renderModuleBlock).join('\n')}`
}

export function downloadHtml(filename: string, html: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.html') ? filename : `${filename}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'email'
}
