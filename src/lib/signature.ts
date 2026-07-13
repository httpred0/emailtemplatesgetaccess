import { Signature, SignatureBg } from '../types'
import { FONT, markDataUri, escapeHtml } from './brand'

interface SigTheme {
  bg: string // '' = transparent
  stroke: string // '' = none
  name: string
  meta: string
  email: string
  web: string
  logo: 'gold' | 'ink'
}

/** Backgrounds mirror the email card surfaces + their outer strokes; None is transparent. */
const SIG_THEMES: Record<SignatureBg, SigTheme> = {
  dark: { bg: '#161616', stroke: '', name: '#FFFFFF', meta: '#A6A6A1', email: '#D1D1CC', web: '#C0A968', logo: 'gold' },
  cream: { bg: '#FAF5E6', stroke: '#E8D4A6', name: '#0D0D0D', meta: '#3D3D3B', email: '#2B2B29', web: '#C0A968', logo: 'ink' },
  light: { bg: '#FFFFFF', stroke: '#F7BE62', name: '#0D0D0D', meta: '#3D3D3B', email: '#2B2B29', web: '#C0A968', logo: 'ink' },
  none: { bg: '', stroke: '', name: '#0D0D0D', meta: '#3D3D3B', email: '#2B2B29', web: '#C0A968', logo: 'ink' },
}

const httpUrl = (s: string) => (/^https?:\/\//i.test(s) ? s : `https://${s}`)

/** The signature block (email-safe table). Fields carry data-slot for inline editing on the canvas. */
export function renderSignatureBlock(sig: Signature): string {
  const t = SIG_THEMES[sig.background] ?? SIG_THEMES.none
  const mark = markDataUri(sig.logo ?? t.logo)
  const wrapStyle = [
    t.bg ? `background-color:${t.bg};` : '',
    t.stroke ? `border:1px solid ${t.stroke};` : '',
    t.bg || t.stroke ? 'border-radius:16px;' : '',
  ].join('')
  const pad = t.bg || t.stroke ? '20px 24px' : '0'
  const contact = `<a href="mailto:${escapeHtml(sig.email)}" style="color:${t.email};text-decoration:none;"><span data-slot="email">${escapeHtml(sig.email)}</span></a><span style="color:${t.meta};"> &nbsp;&middot;&nbsp; </span><a href="${escapeHtml(httpUrl(sig.website))}" style="color:${t.web};text-decoration:none;"><span data-slot="website">${escapeHtml(sig.website)}</span></a>`
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"${t.bg ? ` bgcolor="${t.bg}"` : ''} style="${wrapStyle}"><tr><td style="padding:${pad};">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td valign="middle" style="padding-right:16px;"><img src="${mark}" width="44" height="41" alt="Get Access" style="display:block;width:44px;height:41px;border:0;" /></td>
      <td valign="middle" style="border-left:1px solid ${t.stroke || 'rgba(128,128,128,0.25)'};padding-left:16px;">
        <div data-slot="name" style="font-family:${FONT};font-size:16px;line-height:22px;font-weight:700;color:${t.name};">${escapeHtml(sig.name)}</div>
        <div data-slot="title" style="font-family:${FONT};font-size:14px;line-height:20px;color:${t.meta};padding-top:2px;">${escapeHtml(sig.title)}</div>
        <div style="font-family:${FONT};font-size:14px;line-height:20px;padding-top:8px;">${contact}</div>
      </td>
    </tr></table>
  </td></tr></table>`
}

const stripEditingAttrs = (html: string) => html.replace(/ data-slot="[^"]*"/g, '')

export function renderSignatureHtml(sig: Signature): string {
  const outer = sig.background === 'dark' ? '#0D0D0D' : sig.background === 'none' ? '#FFFFFF' : '#EDEDED'
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(sig.label)}</title>
</head>
<body style="margin:0;padding:24px;background-color:${outer};-webkit-text-size-adjust:100%;">
${stripEditingAttrs(renderSignatureBlock(sig))}
</body>
</html>`
}
