import { ModuleDef } from '../types'
import {
  THEMES,
  ThemeId,
  ACCENTS,
  AccentId,
  accentFor,
  BANNER_CARDS,
  BannerCardId,
  FONT,
  BTN_FONT,
  logoDataUri,
  markDataUri,
  auraPlaceholder,
  textToHtml,
  escapeHtml,
} from '../lib/brand'

/**
 * Get Access email modules — extracted 1:1 from Figma
 * ("DS - Get Access Foundation" → Emails → RawComponents).
 *
 * Every module supports the three surface themes (Dark / Cream / Light).
 * All markup is email-safe: nested tables, inline styles, no flex/grid.
 */

const T = (theme: ThemeId) => THEMES[theme]

const section = (bg: string, inner: string, padding: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"${bg ? ` style="background-color:${bg};"` : ''}><tr><td style="padding:${padding};">${inner}</td></tr></table>`

/** Pill button per Figma: radius 60, pad 16/28, Schibsted Grotesk Medium 16. */
const pillButton = (label: string, url: string, bg: string, solid: string, color: string, border: string, centered = false) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0"${centered ? ' align="center" style="margin:0 auto;"' : ''}><tr><td bgcolor="${solid}" style="background:${bg};border:1px solid ${border};border-radius:60px;mso-padding-alt:16px 28px;"><a href="${escapeHtml(url)}" target="_blank" style="display:inline-block;padding:16px 28px;font-family:${BTN_FONT};font-size:16px;line-height:24px;font-weight:500;color:${color};text-decoration:none;border-radius:60px;">${escapeHtml(label)}</a></td></tr></table>`

const eyebrowHtml = (text: string, color: string, align: 'left' | 'center') =>
  `<div style="font-family:${FONT};font-size:12px;line-height:14px;letter-spacing:-0.3px;text-transform:uppercase;color:${color};text-align:${align};">${textToHtml(text)}</div>`

const headingHtml = (text: string, color: string, align: 'left' | 'center') =>
  `<h1 style="margin:0;font-family:${FONT};font-size:32px;line-height:36px;letter-spacing:-0.8px;font-weight:normal;color:${color};text-align:${align};">${textToHtml(text)}</h1>`

export const MODULES: ModuleDef[] = [
  // ——————————————————— shared (transactional + marketing) ———————————————————
  {
    id: 'logo-heading',
    name: 'Logo heading',
    description: 'The Get Access lockup that opens every email — gold on dark, ink on light surfaces.',
    audience: 'all',
    variants: [
      { id: 'default', name: 'Centered' },
      { id: 'left', name: 'Left aligned' },
    ],
    slots: [],
    toHtml: (_v, variant, theme) => {
      const t = T(theme)
      const logo = logoDataUri(t.logo)
      const align = variant === 'left' ? 'left' : 'center'
      return section(t.bg, `<div style="text-align:${align};"><img src="${logo}" height="22" alt="Get Access" style="display:inline-block;height:22px;width:auto;border:0;" /></div>`, '32px 40px 0px')
    },
  },
  {
    id: 'heading',
    name: 'Heading',
    description: 'Section title, optionally with an uppercase eyebrow above.',
    audience: 'all',
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'eyebrow', name: 'With eyebrow' },
      { id: 'centered', name: 'Centered' },
      { id: 'centered-eyebrow', name: 'Centered + eyebrow' },
    ],
    slots: [
      { key: 'eyebrow', label: 'Eyebrow', type: 'text', default: 'Eyebrow' },
      { key: 'title', label: 'Title', type: 'text', default: 'Reset your password' },
    ],
    toHtml: (v, variant, theme) => {
      const t = T(theme)
      const align = variant.startsWith('centered') ? 'center' : 'left'
      const hasEyebrow = variant === 'eyebrow' || variant === 'centered-eyebrow'
      const eb = hasEyebrow ? `${eyebrowHtml(v.eyebrow, t.body, align)}<div style="height:8px;line-height:8px;font-size:0;">&nbsp;</div>` : ''
      return section(t.bg, `${eb}${headingHtml(v.title, t.heading, align)}`, '40px 40px 8px')
    },
  },
  {
    id: 'body',
    name: 'Body',
    description: 'A paragraph of body copy. Supports merge tags like {{first_name}}.',
    audience: 'all',
    variants: [
      { id: 'plain', name: 'Body' },
      { id: 'link', name: 'Body with link' },
      { id: 'centered', name: 'Centered' },
      { id: 'centered-link', name: 'Centered with link' },
    ],
    slots: [
      { key: 'text', label: 'Text', type: 'longtext', default: 'A password reset was requested for this account. The link expires in 30 minutes.' },
      { key: 'linkLabel', label: 'Link label', type: 'text', default: 'Contact your concierge' },
      { key: 'linkUrl', label: 'Link URL', type: 'url', default: 'https://getaccess.com' },
    ],
    toHtml: (v, variant, theme) => {
      const t = T(theme)
      const align = variant.startsWith('centered') ? 'center' : 'left'
      const hasLink = variant === 'link' || variant === 'centered-link'
      const link = hasLink ? ` <a href="${escapeHtml(v.linkUrl)}" style="color:${t.link};text-decoration:underline;">${textToHtml(v.linkLabel)}</a>` : ''
      return section(t.bg, `<p style="margin:0;font-family:${FONT};font-size:16px;line-height:24px;color:${t.body};text-align:${align};">${textToHtml(v.text)}${link}</p>`, '0px 40px 24px')
    },
  },
  {
    id: 'list',
    name: 'List',
    description: 'Bulleted or numbered list. One item per line.',
    audience: 'all',
    variants: [
      { id: 'bullet', name: 'Bullet list' },
      { id: 'numbered', name: 'Numbered list' },
    ],
    slots: [
      { key: 'items', label: 'Items (one per line)', type: 'longtext', default: 'Committee review.\nAccredited investor verification, as required under Rule 506(c).\nDecision by email.' },
    ],
    toHtml: (v, variant, theme) => {
      const t = T(theme)
      const items = v.items.split('\n').map((s) => s.trim()).filter(Boolean)
      const rows = items
        .map((item, i) => {
          const marker = variant === 'numbered' ? String(i + 1) : '&bull;'
          return `<tr><td width="16" valign="top" style="font-family:${FONT};font-size:16px;line-height:22px;color:${t.muted};text-align:center;padding:${i > 0 ? '12px' : '0'} 0 0;">${marker}</td><td width="12" style="font-size:0;">&nbsp;</td><td valign="top" style="font-family:${FONT};font-size:16px;line-height:22px;color:${t.body};padding:${i > 0 ? '12px' : '0'} 0 0;">${textToHtml(item)}</td></tr>`
        })
        .join('')
      return section(t.bg, `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>`, '24px 40px')
    },
  },
  {
    id: 'code',
    name: 'Verification code',
    description: 'One-time code displayed as character boxes.',
    audience: 'all',
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'centered', name: 'Centered' },
    ],
    slots: [
      { key: 'code', label: 'Code (or merge tag)', type: 'text', default: 'LH5W09', help: 'Up to 8 characters. A merge tag like {{code}} renders one box per character of the tag when sent.' },
    ],
    toHtml: (v, variant, theme) => {
      const t = T(theme)
      const chars = v.code.slice(0, 8).split('')
      const cells = chars
        .map(
          (c, i) =>
            `${i > 0 ? '<td width="8" style="font-size:0;">&nbsp;</td>' : ''}<td width="72" align="center" bgcolor="${theme === 'dark' ? '#222220' : t.codeBg}" style="background-color:${t.codeBg};border:1px solid ${t.codeBorder};border-radius:8px;padding:14px 4px;font-family:${FONT};font-size:32px;line-height:36px;font-weight:bold;letter-spacing:0.3px;color:${t.codeChar};">${escapeHtml(c)}</td>`,
        )
        .join('')
      const align = variant === 'centered' ? 'center' : 'left'
      return section(t.bg, `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${align}" style="margin:0 ${align === 'center' ? 'auto' : '0'};"><tr>${cells}</tr></table>`, '24px 40px')
    },
  },
  {
    id: 'secondary-note',
    name: 'Secondary note',
    description: 'De-emphasized supporting line — “if you didn’t request this…”',
    audience: 'all',
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'centered', name: 'Centered' },
    ],
    slots: [
      { key: 'text', label: 'Text', type: 'longtext', default: 'If you didn’t request this, ignore this email. Your password is unchanged.' },
    ],
    toHtml: (v, variant, theme) => {
      const t = T(theme)
      const align = variant === 'centered' ? 'center' : 'left'
      return section(t.bg, `<p style="margin:0;font-family:${FONT};font-size:16px;line-height:24px;color:${t.note};text-align:${align};">${textToHtml(v.text)}</p>`, '24px 40px')
    },
  },
  {
    id: 'spacer',
    name: 'Spacer',
    description: 'Vertical breathing room in five sizes.',
    audience: 'all',
    variants: [
      { id: 's4', name: '4px' },
      { id: 's8', name: '8px' },
      { id: 's12', name: '12px' },
      { id: 's16', name: '16px' },
      { id: 's24', name: '24px' },
    ],
    slots: [],
    toHtml: (_v, variant, theme) => {
      const t = T(theme)
      const h = Number(variant.slice(1)) || 8
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${t.bg};"><tr><td style="height:${h}px;line-height:${h}px;font-size:0;">&nbsp;</td></tr></table>`
    },
  },
  {
    id: 'divider',
    name: 'Divider',
    description: 'Hairline rule, inset to the content column.',
    audience: 'all',
    variants: [{ id: 'default', name: 'Default' }],
    slots: [],
    toHtml: (_v, _variant, theme) => {
      const t = T(theme)
      return section(t.bg, `<div style="border-top:1px solid ${t.divider};font-size:0;line-height:0;">&nbsp;</div>`, '12px 40px')
    },
  },
  {
    id: 'buttons',
    name: 'Buttons',
    description: 'Pill buttons — single primary, single secondary, or a pair.',
    audience: 'all',
    variants: [
      { id: 'primary', name: 'Primary' },
      { id: 'secondary', name: 'Secondary' },
      { id: 'couple', name: 'Primary + secondary' },
      { id: 'primary-centered', name: 'Primary centered' },
      { id: 'secondary-centered', name: 'Secondary centered' },
      { id: 'couple-centered', name: 'Pair centered' },
    ],
    slots: [
      { key: 'label1', label: 'Button label', type: 'text', default: 'Reset password' },
      { key: 'url1', label: 'Button link', type: 'url', default: 'https://getaccess.com' },
      { key: 'label2', label: 'Second label (pair only)', type: 'text', default: 'Learn more' },
      { key: 'url2', label: 'Second link (pair only)', type: 'url', default: 'https://getaccess.com' },
    ],
    toHtml: (v, variant, theme) => {
      const t = T(theme)
      const centered = variant.endsWith('-centered')
      const kind = centered ? variant.replace('-centered', '') : variant
      const primary = pillButton(v.label1, v.url1, t.btnPrimaryBg, t.btnPrimarySolid, t.btnPrimaryText, 'rgba(250,240,225,0.04)', centered)
      const secondary = (label: string, url: string) => pillButton(label, url, t.btnSecondaryBg, theme === 'dark' ? '#26261F' : '#E3DECF', t.btnSecondaryText, t.btnSecondaryBorder, centered)
      let inner = primary
      if (kind === 'secondary') inner = secondary(v.label1, v.url1)
      if (kind === 'couple')
        inner = `<table role="presentation" cellpadding="0" cellspacing="0" border="0"${centered ? ' align="center" style="margin:0 auto;"' : ''}><tr><td>${pillButton(v.label1, v.url1, t.btnPrimaryBg, t.btnPrimarySolid, t.btnPrimaryText, 'rgba(250,240,225,0.04)')}</td><td width="12" style="font-size:0;">&nbsp;</td><td>${pillButton(v.label2, v.url2, t.btnSecondaryBg, theme === 'dark' ? '#26261F' : '#E3DECF', t.btnSecondaryText, t.btnSecondaryBorder)}</td></tr></table>`
      return section(t.bg, inner, '8px 40px')
    },
  },
  {
    id: 'callout',
    name: 'Callout',
    description: 'Outlined highlight box, optionally with a link.',
    audience: 'all',
    variants: [
      { id: 'regular', name: 'Regular' },
      { id: 'link', name: 'With link' },
    ],
    slots: [
      { key: 'text', label: 'Text', type: 'longtext', default: 'Your concierge is Elena Marsh.' },
      { key: 'linkLabel', label: 'Link label', type: 'text', default: 'Reply to this email' },
      { key: 'linkUrl', label: 'Link URL', type: 'url', default: 'mailto:concierge@getaccess.com' },
    ],
    toHtml: (v, variant, theme) => {
      const t = T(theme)
      const link = variant === 'link' ? ` <a href="${escapeHtml(v.linkUrl)}" style="color:${t.calloutText};text-decoration:underline;">${textToHtml(v.linkLabel)}</a>` : ''
      const box = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:${t.calloutBg};border-left:2px solid ${t.calloutBorder};border-radius:0 8px 8px 0;padding:12px 20px;font-family:${FONT};font-size:16px;line-height:24px;color:${t.calloutText};">${textToHtml(v.text)}${link}</td></tr></table>`
      return section(t.bg, box, '24px 40px')
    },
  },
  {
    id: 'image',
    name: 'Image',
    description: 'Single image — inset with rounded corners, or full-bleed.',
    audience: 'all',
    variants: [
      { id: 'default', name: 'Inset' },
      { id: 'full', name: 'Full width' },
    ],
    slots: [
      { key: 'image', label: 'Image', type: 'image', default: auraPlaceholder(600, 283) },
      { key: 'alt', label: 'Alt text', type: 'text', default: '' },
    ],
    toHtml: (v, variant, theme) => {
      const t = T(theme)
      if (variant === 'full')
        return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${t.bg};"><tr><td><img src="${v.image}" width="600" alt="${escapeHtml(v.alt)}" style="display:block;width:100%;height:auto;border:0;" /></td></tr></table>`
      return section(t.bg, `<img src="${v.image}" width="520" alt="${escapeHtml(v.alt)}" style="display:block;width:100%;height:auto;border:0;border-radius:16px;" />`, '24px 40px')
    },
  },
  {
    id: 'footer',
    name: 'Footer',
    description: 'Logo, address, contact and legal links.',
    audience: 'all',
    variants: [{ id: 'default', name: 'Default' }],
    slots: [
      { key: 'address', label: 'Address', type: 'longtext', default: '2108 N ST #15558\nSacramento, CA 95816 USA' },
      { key: 'contact', label: 'Contact line', type: 'text', default: 'Questions? concierge@getaccess.com' },
      { key: 'privacyUrl', label: 'Privacy Policy URL', type: 'url', default: 'https://getaccess.com/privacy' },
      { key: 'termsUrl', label: 'Terms of Service URL', type: 'url', default: 'https://getaccess.com/terms' },
      { key: 'unsubUrl', label: 'Unsubscribe URL', type: 'url', default: 'https://getaccess.com/unsubscribe' },
    ],
    toHtml: (v, _variant, theme) => {
      const t = T(theme)
      const mark = markDataUri(t.logo)
      const legal = (label: string, url: string, last = false) =>
        `<div style="padding-bottom:${last ? 0 : 20}px;text-align:right;"><a href="${escapeHtml(url)}" style="font-family:${FONT};font-size:12px;line-height:18px;color:${t.note};text-decoration:underline;">${label}</a></div>`
      const inner = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td valign="top">
          <img src="${mark}" width="30" height="28" alt="Get Access" style="display:block;width:30px;height:28px;border:0;" />
          <p style="margin:12px 0 0;font-family:${FONT};font-size:14px;line-height:21px;color:${t.muted};">${textToHtml(v.address)}</p>
          <p style="margin:12px 0 0;font-family:${FONT};font-size:14px;line-height:21px;color:${t.muted};">${textToHtml(v.contact)}</p>
        </td>
        <td width="140" valign="middle" align="right">
          ${legal('Privacy Policy', v.privacyUrl)}${legal('Terms of Service', v.termsUrl)}${legal('Unsubscribe', v.unsubUrl, true)}
        </td>
      </tr></table>`
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${t.footerBg};border-top:1px solid ${t.footerBorder};"><tr><td style="padding:24px 40px;">${inner}</td></tr></table>`
    },
  },
  {
    id: 'disclosure',
    name: 'Disclosure',
    description: 'Legal small print and copyright, below the email card.',
    audience: 'all',
    variants: [{ id: 'default', name: 'Default' }],
    slots: [
      { key: 'legal', label: 'Legal text', type: 'longtext', default: 'For informational purposes only and intended for approved users. This message does not constitute an offer to sell or a solicitation of an offer to buy any security.' },
      { key: 'copyright', label: 'Copyright line', type: 'text', default: '© 2026 Get Access. All rights reserved.' },
    ],
    toHtml: (v, _variant, theme) => {
      // No background by design (per Figma) — the disclosure sits on the outer canvas.
      // Text color tuned per canvas: dark #A6A6A1, cream #696967, light #7A7A75.
      const color = theme === 'dark' ? '#A6A6A1' : theme === 'cream' ? '#696967' : '#7A7A75'
      return section(
        '',
        `<p style="margin:0 0 16px;font-family:${FONT};font-size:12px;line-height:18px;color:${color};">${textToHtml(v.legal)}</p><p style="margin:0;font-family:${FONT};font-size:12px;line-height:18px;color:${color};">${textToHtml(v.copyright)}</p>`,
        '24px 0 32px',
      )
    },
  },
  // ——————————————————— marketing only ———————————————————
  {
    id: 'feature',
    name: 'Feature card',
    description: 'Card with image beside title and text.',
    audience: 'marketing',
    variants: [
      { id: 'img-left', name: 'Image left' },
      { id: 'img-right', name: 'Image right' },
    ],
    slots: [
      { key: 'image', label: 'Image', type: 'image', default: auraPlaceholder(169, 130) },
      { key: 'title', label: 'Title', type: 'text', default: 'Title Goes Here' },
      { key: 'text', label: 'Text', type: 'longtext', default: 'Two or three lines that explain why this matters to the reader.' },
    ],
    toHtml: (v, variant, theme) => {
      const t = T(theme)
      const imgRadius = variant === 'img-left' ? '16px 0 0 16px' : '0 16px 16px 0'
      // Background-image cell so the image always fills the card's full height.
      const img = `<td width="169" height="130" background="${v.image}" bgcolor="${theme === 'dark' ? '#242422' : '#E7E0D2'}" style="background-image:url('${v.image}');background-size:cover;background-position:center;border-radius:${imgRadius};font-size:0;line-height:0;">&nbsp;</td>`
      const gap = `<td width="24" style="font-size:0;">&nbsp;</td>`
      const content = `<td valign="middle" style="padding:16px ${variant === 'img-left' ? '24px 16px 0' : '0 16px 24px'};">
        <h3 style="margin:0 0 8px;font-family:${FONT};font-size:20px;line-height:22px;font-weight:normal;color:${t.heading};">${textToHtml(v.title)}</h3>
        <p style="margin:0;font-family:${FONT};font-size:16px;line-height:24px;color:${t.body};">${textToHtml(v.text)}</p>
      </td>`
      const cells = variant === 'img-left' ? `${img}${gap}${content}` : `${content}${gap}${img}`
      const card = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${t.cardBg};border-radius:16px;"><tr>${cells}</tr></table>`
      return section(t.bg, card, '24px 40px')
    },
  },
  {
    id: 'banner-cta',
    name: 'Banner CTA',
    description: 'Editorial card with eyebrow pill, title, text and button. Four card colors.',
    audience: 'marketing',
    variants: [
      { id: 'cream', name: 'Cream' },
      { id: 'dark', name: 'Dark' },
      { id: 'turquoise', name: 'Turquoise' },
      { id: 'emerald', name: 'Emerald' },
      { id: 'sapphire', name: 'Sapphire' },
    ],
    slots: [
      { key: 'eyebrow', label: 'Eyebrow', type: 'text', default: 'Eyebrow' },
      { key: 'title', label: 'Title', type: 'text', default: 'Title Goes Here' },
      { key: 'text', label: 'Text', type: 'longtext', default: 'A short editorial paragraph that frames the action below.' },
      { key: 'ctaLabel', label: 'Button label', type: 'text', default: 'Get started' },
      { key: 'ctaUrl', label: 'Button link', type: 'url', default: 'https://getaccess.com' },
    ],
    toHtml: (v, variant, theme) => {
      const t = T(theme)
      const card = BANNER_CARDS[(variant as BannerCardId) in BANNER_CARDS ? (variant as BannerCardId) : 'cream']
      // Light-colored cards carry ink content; the dark card flips to cream content + gold button.
      const isDark = variant === 'dark'
      const titleColor = isDark ? '#FFFFFF' : '#161616'
      const bodyColor = isDark ? 'rgba(250,245,230,0.8)' : 'rgba(22,22,22,0.8)'
      const pillBorder = isDark ? 'rgba(250,245,230,0.24)' : 'rgba(22,22,22,0.24)'
      const pill = `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="border:1px solid ${pillBorder};border-radius:16px;padding:8px 12px;font-family:${BTN_FONT};font-size:14px;line-height:16px;font-weight:500;text-transform:uppercase;color:${bodyColor};">${textToHtml(v.eyebrow)}</td></tr></table>`
      const btn = isDark
        ? pillButton(v.ctaLabel, v.ctaUrl, 'linear-gradient(180deg,#DFC8A1 0%,#F6E6CA 100%)', '#E9D6B2', '#0D0D0D', 'rgba(250,240,225,0.04)')
        : pillButton(v.ctaLabel, v.ctaUrl, '#161616', '#161616', '#FFFFFF', 'rgba(250,240,225,0.04)')
      const inner = `${pill}
        <h2 style="margin:24px 0 16px;font-family:${FONT};font-size:32px;line-height:36px;font-weight:normal;color:${titleColor};">${textToHtml(v.title)}</h2>
        <p style="margin:0 0 24px;font-family:${FONT};font-size:16px;line-height:24px;color:${bodyColor};">${textToHtml(v.text)}</p>
        ${btn}`
      const cardHtml = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${card.solid}" style="background:${card.bg};border:1px solid rgba(250,240,225,0.15);border-radius:16px;padding:32px;">${inner}</td></tr></table>`
      return section(t.bg, cardHtml, '24px 40px')
    },
  },
  {
    id: 'card-numbered',
    name: 'Numbered card',
    description: 'Step card with an accent number badge — for sequences and how-it-works.',
    audience: 'marketing',
    variants: [
      { id: 'sapphire', name: 'Sapphire' },
      { id: 'emerald', name: 'Emerald' },
      { id: 'turquoise', name: 'Turquoise' },
    ],
    slots: [
      { key: 'number', label: 'Number', type: 'text', default: '1' },
      { key: 'title', label: 'Title', type: 'text', default: 'Title Goes Here' },
      { key: 'text', label: 'Text', type: 'longtext', default: 'A short paragraph describing this step.' },
    ],
    toHtml: (v, variant, theme) => {
      const t = T(theme)
      const a = accentFor((variant as AccentId) in ACCENTS ? (variant as AccentId) : 'sapphire', theme)
      // Card surface per Figma: #161616 dark / #FFFBF0 cream / #F5F5F2 light,
      // with the accent "glow" (20% blurred ellipse, top-right) approximated as a gradient.
      const cardBg = theme === 'dark' ? '#161616' : theme === 'cream' ? '#FFFBF0' : '#F5F5F2'
      const glow = `background-image:linear-gradient(to bottom left, ${a.glow}, rgba(0,0,0,0) 55%);`
      const badge = `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="38" height="38" align="center" style="background-color:${a.bg};border:1px solid ${a.main};border-radius:8px;font-family:${FONT};font-size:16px;line-height:18px;font-weight:bold;color:${a.main};">${textToHtml(v.number)}</td></tr></table>`
      const card = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${cardBg}" style="background-color:${cardBg};${glow}border:1px solid rgba(250,240,225,0.04);border-radius:24px;padding:24px;">
        ${badge}
        <h3 style="margin:16px 0 8px;font-family:${FONT};font-size:32px;line-height:36px;font-weight:normal;color:${t.heading};">${textToHtml(v.title)}</h3>
        <p style="margin:0;font-family:${FONT};font-size:16px;line-height:24px;color:${t.body};">${textToHtml(v.text)}</p>
      </td></tr></table>`
      return section(t.bg, card, '24px 40px')
    },
  },
  {
    id: 'highlight',
    name: 'Highlight item',
    description: 'Row with label, description and an accent tag — for facts, stats or line items.',
    audience: 'marketing',
    variants: [
      { id: 'sapphire', name: 'Sapphire' },
      { id: 'emerald', name: 'Emerald' },
      { id: 'turquoise', name: 'Turquoise' },
    ],
    slots: [
      { key: 'label', label: 'Label', type: 'text', default: 'Item 1' },
      { key: 'description', label: 'Description', type: 'text', default: 'Description' },
      { key: 'tag', label: 'Tag', type: 'text', default: 'Main content' },
    ],
    toHtml: (v, variant, theme) => {
      const t = T(theme)
      const a = accentFor((variant as AccentId) in ACCENTS ? (variant as AccentId) : 'sapphire', theme)
      const label = theme === 'dark' ? t.body : '#161616'
      const row = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom:1px solid ${a.main};"><tr>
        <td valign="middle" style="padding:0 0 12px;font-family:${FONT};font-size:16px;line-height:24px;color:${label};">${textToHtml(v.label)} &bull; <span style="color:${t.note};">${textToHtml(v.description)}</span></td>
        <td align="right" valign="middle" style="padding:0 0 12px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right"><tr><td style="background-color:${a.bg};border:1px solid ${a.deep};border-radius:8px;padding:6px 10px;font-family:${FONT};font-size:14px;line-height:16px;color:${a.deep};">${textToHtml(v.tag)}</td></tr></table></td>
      </tr></table>`
      return section(t.bg, row, '8px 40px')
    },
  },
]

export const moduleById = (id: string): ModuleDef | undefined => MODULES.find((m) => m.id === id)

export function defaultValues(mod: ModuleDef): Record<string, string> {
  const out: Record<string, string> = {}
  for (const s of mod.slots) out[s.key] = s.default
  return out
}
