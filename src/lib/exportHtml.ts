import { EmailTemplate, ModuleInstance } from '../types'
import { moduleById } from '../modules/registry'
import { ThemeId, escapeHtml } from './brand'
import { Provider, transformTokens } from './tokens'

export type { Provider }

/** Outer canvas behind the 600px email card, per theme. `solid` is the Outlook/bgcolor fallback. */
const OUTER_BG: Record<ThemeId, { css: string; solid: string }> = {
  dark: { css: '#0D0D0D', solid: '#0D0D0D' },
  cream: { css: '#FAFAFA', solid: '#FAFAFA' },
  light: { css: 'linear-gradient(80deg, #F4F4F2 50.64%, #F8F8ED 140.84%)', solid: '#F4F4F2' },
}

/** Cream and Light frame the card with a brand stroke; dark is borderless. */
const CARD_BORDER: Record<ThemeId, string> = {
  dark: 'none',
  cream: '1px solid #E8D4A6',
  light: '1px solid #F7BE62',
}

export function renderModuleBlock(inst: ModuleInstance): string {
  const mod = moduleById(inst.moduleId)
  if (!mod) return `<!-- unknown module: ${inst.moduleId} -->`
  const values = { ...Object.fromEntries(mod.slots.map((s) => [s.key, s.default])), ...inst.values }
  return mod.toHtml(values, inst.variantId, inst.color ?? 'dark')
}

export const CARD_RADIUS = 24

const roundedCard = (inner: string, theme: ThemeId) =>
  inner
    ? `<div style="border-radius:${CARD_RADIUS}px;overflow:hidden;border:${CARD_BORDER[theme]};">\n${inner}\n</div>`
    : ''

/** Signature modules render OUTSIDE the rounded card, at the end (on the page background). */
export function splitModules(modules: ModuleInstance[]): { card: ModuleInstance[]; tail: ModuleInstance[] } {
  return {
    card: modules.filter((m) => m.moduleId !== 'signature'),
    tail: modules.filter((m) => m.moduleId === 'signature'),
  }
}

function composeBody(modules: ModuleInstance[], theme: ThemeId): string {
  const { card, tail } = splitModules(modules)
  const cardHtml = roundedCard(card.map(renderModuleBlock).join('\n'), theme)
  const tailHtml = tail.map(renderModuleBlock).join('\n')
  return `${cardHtml}\n${tailHtml}`
}

function emailShell(title: string, preheaderHtml: string, theme: ThemeId, bodyBlocks: string): string {
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(title)}</title>
  <style>
    /* Large-tier CTAs go full-width on mobile; unsupported clients keep the 56px content-width pill. */
    @media only screen and (max-width: 480px) {
      table.btn-pill { width: 100% !important; }
      table.btn-pill a { display: block !important; text-align: center !important; }
      table.btn-pair { width: 100% !important; }
      table.btn-pair > tbody > tr > td { display: block !important; width: 100% !important; }
      table.btn-pair td.btn-gap { height: 12px !important; width: auto !important; line-height: 12px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${OUTER_BG[theme].solid};-webkit-text-size-adjust:100%;">
${preheaderHtml}
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

/** Markers used only in the builder/pipeline (data-slot/-rich for editing, data-ga-* for provider rewrites). */
const stripMarkers = (html: string) =>
  html.replace(/ data-(slot|rich|ga-unsub|ga-address|ga-copyright)="[^"]*"/g, '')

/** HubSpot needs a real unsubscribe: point the marked footer link at its native token. */
const hubspotUnsub = (html: string) =>
  html.replace(/<a\b[^>]*\bdata-ga-unsub="[^"]*"[^>]*>/g, (tag) =>
    tag.replace(/href="[^"]*"/, 'href="{{ unsubscribe_link }}"'),
  )

/**
 * HubSpot enforces CAN-SPAM: the sender's physical address and company name must appear as
 * its native site_settings tokens (validated at publish). Swap the footer's literal address
 * line for the account address tokens, and the copyright's company name for the name token —
 * preserving the year. Resend keeps the literals the user typed.
 */
const HUBSPOT_ADDRESS =
  '{{ site_settings.company_street_address_1 }}, {{ site_settings.company_city }}, {{ site_settings.company_state }} {{ site_settings.company_zip }}'

const hubspotFooter = (html: string) =>
  html
    .replace(/(<p\b[^>]*\bdata-ga-address="[^"]*"[^>]*>)[\s\S]*?(<\/p>)/g, `$1${HUBSPOT_ADDRESS}$2`)
    .replace(/(<p\b[^>]*\bdata-ga-copyright="[^"]*"[^>]*>)([\s\S]*?)(<\/p>)/g, (_m, open, inner, close) => {
      const year = (inner.match(/\b(?:19|20)\d{2}\b/) || [''])[0]
      return `${open}© ${year ? `${year} ` : ''}{{ site_settings.company_name }}. All rights reserved.${close}`
    })

/** HubL string escape for a {% … value="…" %} argument (backslash-escape " and \). */
const hublString = (s: string) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

/**
 * Preview/preheader text, placed right after <body>. Provider-specific:
 * - HubSpot: an editable {% text "preview_text" %} field, pre-filled with the template's preheader
 *   (still editable in HubSpot). Merge tokens are dropped from the default — they're invalid inside
 *   the HubL value; add preheader personalization via HubSpot's token picker instead.
 * - Resend: a hidden div carrying the preheader text, with a loud reminder if it's left blank.
 */
function preheaderBlock(preheader: string, provider: Provider): string {
  if (provider === 'hubspot') {
    const value = hublString(preheader.replace(/\{\{[^}]*\}\}/g, '').replace(/\s+/g, ' ').trim())
    return `  <!-- Preview text: editable within HubSpot's email editor -->
  <div id="preview_text" style="display:none!important;max-height:0;max-width:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#0D0D0D;opacity:0;">
    {% text "preview_text"
      label="Preview Text <span class=help-text>This text appears after the subject line in supported email clients.</span>",
      value="${value}",
      no_wrapper=True
    %}
  </div>
  <!-- Preview text ends here -->`
  }
  const text = escapeHtml(preheader).trim() || 'ADD PREVIEW TEXT. REQUIRED!'
  return `  <!-- Email preview/preheader text -->
  <div style="display:none!important;max-height:0;max-width:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;opacity:0;color:transparent;">
    ${text}
  </div>
  <!-- End of email preview -->`
}

/**
 * Provider-agnostic pipeline. The ONLY provider-specific steps are the preheader block, the HubSpot
 * unsubscribe + footer-token rewrites and the token transform; everything else (modules, card) is shared.
 */
function finalize(bodyRaw: string, title: string, preheader: string, theme: ThemeId, provider: Provider): string {
  const body = stripMarkers(provider === 'hubspot' ? hubspotFooter(hubspotUnsub(bodyRaw)) : bodyRaw)
  return transformTokens(emailShell(title, preheaderBlock(preheader, provider), theme, body), provider)
}

export function renderEmailHtml(t: EmailTemplate, provider: Provider = 'resend'): string {
  const theme = t.theme ?? 'dark'
  return finalize(composeBody(t.modules, theme), t.subject || t.name, t.preheader, theme, provider)
}

export function renderSingleModuleHtml(inst: ModuleInstance, name: string, provider: Provider = 'resend'): string {
  const theme = inst.color ?? 'dark'
  // A lone signature module renders outside the card; anything else keeps the card frame.
  const body = inst.moduleId === 'signature' ? renderModuleBlock(inst) : roundedCard(renderModuleBlock(inst), theme)
  return finalize(body, name, '', theme, provider)
}

/** Bare-canvas markup for gallery thumbnails (no <html> wrapper). */
export function renderCanvasHtml(t: EmailTemplate): string {
  return composeBody(t.modules, t.theme ?? 'dark')
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
