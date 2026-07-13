import { ModuleDef } from '../types'
import { richToHtml } from '../lib/rich'
import { iconDataUri, iconOptions, DEFAULT_ICON } from '../lib/icons'
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
  isLightHex,
  EYEBROW_GOLD,
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

/** Pill button per spec: radius 28, pad 16/28, Arial Medium 16, 56px tall. Goes full-width on mobile via .btn-pill. */
const pillButton = (label: string, url: string, bg: string, solid: string, color: string, border: string, centered = false, slotKey?: string) =>
  `<table role="presentation" class="btn-pill" cellpadding="0" cellspacing="0" border="0"${centered ? ' align="center" style="margin:0 auto;"' : ''}><tr><td align="center" bgcolor="${solid}" style="background:${bg};border:1px solid ${border};border-radius:28px;mso-padding-alt:16px 28px;"><a href="${escapeHtml(url)}" target="_blank" style="display:inline-block;padding:16px 28px;font-family:${BTN_FONT};font-size:16px;line-height:24px;font-weight:500;color:${color};text-decoration:none;border-radius:28px;">${slotKey ? `<span data-slot="${slotKey}">` : ''}${escapeHtml(label)}${slotKey ? '</span>' : ''}</a></td></tr></table>`

const eyebrowHtml = (text: string, color: string, align: 'left' | 'center') =>
  `<div data-slot="eyebrow" style="font-family:${FONT};font-size:12px;line-height:14px;letter-spacing:-0.3px;text-transform:uppercase;color:${color};text-align:${align};">${textToHtml(text)}</div>`

/** Heading sizes: small 24 / normal 32 (Figma default) / big 44 — 112% line-height, -2.5% tracking. */
const HEADING_SIZES: Record<string, number> = { small: 24, normal: 32, big: 44 }

const headingHtml = (text: string, color: string, align: 'left' | 'center', sizePx = 32) =>
  `<h1 data-slot="title" style="margin:0;font-family:${FONT};font-size:${sizePx}px;line-height:${Math.round(sizePx * 1.12)}px;letter-spacing:${-Math.round(sizePx * 2.5) / 100}px;font-weight:normal;color:${color};text-align:${align};">${textToHtml(text)}</h1>`

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
      { id: 'default', name: 'Left aligned' },
      { id: 'eyebrow', name: 'Left + eyebrow' },
      { id: 'centered', name: 'Centered' },
      { id: 'centered-eyebrow', name: 'Centered + eyebrow' },
    ],
    slots: [
      { key: 'eyebrow', label: 'Eyebrow', type: 'text', default: 'Eyebrow' },
      { key: 'title', label: 'Title', type: 'text', default: 'Reset your password' },
      {
        key: 'size',
        label: 'Size',
        type: 'select',
        default: 'normal',
        options: [
          { value: 'small', label: 'Small (24px)' },
          { value: 'normal', label: 'Normal (32px)' },
          { value: 'big', label: 'Big (44px)' },
        ],
      },
    ],
    toHtml: (v, variant, theme) => {
      const t = T(theme)
      const align = variant.startsWith('centered') ? 'center' : 'left'
      const hasEyebrow = variant === 'eyebrow' || variant === 'centered-eyebrow'
      const eb = hasEyebrow ? `${eyebrowHtml(v.eyebrow, EYEBROW_GOLD, align)}<div style="height:8px;line-height:8px;font-size:0;">&nbsp;</div>` : ''
      const sizePx = HEADING_SIZES[v.size] ?? HEADING_SIZES.normal
      return section(t.bg, `${eb}${headingHtml(v.title, t.heading, align, sizePx)}`, '40px 40px 8px')
    },
  },
  {
    id: 'body',
    name: 'Body',
    description: 'A paragraph of body copy. Supports merge tags like {{first_name}}.',
    audience: 'all',
    variants: [
      { id: 'plain', name: 'Left aligned' },
      { id: 'link', name: 'Left with link' },
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
      // link variants keep panel-only editing (the appended link would get swallowed by inline edits)
      const editable = hasLink ? '' : ' data-slot="text" data-rich="1"'
      return section(t.bg, `<div${editable} style="margin:0;font-family:${FONT};font-size:16px;line-height:24px;color:${t.body};text-align:${align};">${richToHtml(v.text, t.link)}${link}</div>`, '0px 40px 24px')
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
      { id: 'default', name: 'Left aligned' },
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
      { id: 'default', name: 'Left aligned' },
      { id: 'centered', name: 'Centered' },
    ],
    slots: [
      { key: 'text', label: 'Text', type: 'longtext', default: 'If you didn’t request this, ignore this email. Your password is unchanged.' },
    ],
    toHtml: (v, variant, theme) => {
      const t = T(theme)
      const align = variant === 'centered' ? 'center' : 'left'
      return section(t.bg, `<div data-slot="text" data-rich="1" style="margin:0;font-family:${FONT};font-size:16px;line-height:24px;color:${t.note};text-align:${align};">${richToHtml(v.text, t.link)}</div>`, '24px 40px')
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
      { id: 'primary', name: 'Primary left' },
      { id: 'secondary', name: 'Secondary left' },
      { id: 'couple', name: 'Pair left' },
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
      const primary = pillButton(v.label1, v.url1, t.btnPrimaryBg, t.btnPrimarySolid, t.btnPrimaryText, 'rgba(250,240,225,0.04)', centered, 'label1')
      const secondary = (label: string, url: string) => pillButton(label, url, t.btnSecondaryBg, theme === 'dark' ? '#26261F' : '#E3DECF', t.btnSecondaryText, t.btnSecondaryBorder, centered, 'label1')
      let inner = primary
      if (kind === 'secondary') inner = secondary(v.label1, v.url1)
      if (kind === 'couple')
        inner = `<table role="presentation" class="btn-pair" cellpadding="0" cellspacing="0" border="0"${centered ? ' align="center" style="margin:0 auto;"' : ''}><tr><td>${pillButton(v.label1, v.url1, t.btnPrimaryBg, t.btnPrimarySolid, t.btnPrimaryText, 'rgba(250,240,225,0.04)', false, 'label1')}</td><td class="btn-gap" width="12" style="font-size:0;">&nbsp;</td><td>${pillButton(v.label2, v.url2, t.btnSecondaryBg, theme === 'dark' ? '#26261F' : '#E3DECF', t.btnSecondaryText, t.btnSecondaryBorder, false, 'label2')}</td></tr></table>`
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
      const link = variant === 'link' ? ` <a href="${escapeHtml(v.linkUrl)}" style="color:${t.link};text-decoration:underline;">${textToHtml(v.linkLabel)}</a>` : ''
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
    variants: [
      { id: 'no-stroke', name: 'No stroke' },
      { id: 'default', name: 'Top stroke' },
    ],
    slots: [
      { key: 'address', label: 'Address', type: 'longtext', default: '2108 N ST #15558\nSacramento, CA 95816 USA' },
      { key: 'contact', label: 'Contact line', type: 'text', default: 'concierge@getaccess.com' },
      { key: 'privacyUrl', label: 'Privacy Policy URL', type: 'url', default: 'https://getaccess.com/privacy' },
      { key: 'termsUrl', label: 'Terms of Service URL', type: 'url', default: 'https://getaccess.com/terms' },
      { key: 'unsubUrl', label: 'Unsubscribe URL', type: 'url', default: 'https://getaccess.com/unsubscribe' },
      { key: 'copyright', label: 'Copyright', type: 'text', default: '© 2026 Get Access. All rights reserved.' },
    ],
    toHtml: (v, variant, theme) => {
      const t = T(theme)
      const mark = markDataUri(t.logo)
      // Footer is always centered; only the top stroke toggles (legacy ids still resolve).
      const noStroke = variant.includes('no-stroke')
      const topStroke = noStroke ? '' : `border-top:1px solid ${t.footerBorder};`
      const link = (label: string, url: string) =>
        `<a href="${escapeHtml(url)}" style="font-family:${FONT};font-size:12px;line-height:18px;color:${t.muted};text-decoration:underline;">${label}</a>`
      const inner = `
          <div style="text-align:center;"><img src="${mark}" width="30" height="28" alt="Get Access" style="display:inline-block;width:30px;height:28px;border:0;" /></div>
          <p style="margin:16px 0 0;font-family:${FONT};font-size:12px;line-height:18px;color:${t.muted};text-align:center;">${link('Privacy Policy', v.privacyUrl)}&nbsp;&nbsp;&nbsp;${link('Terms of Service', v.termsUrl)}&nbsp;&nbsp;&nbsp;<span data-slot="contact" style="text-decoration:underline;">${textToHtml(v.contact)}</span></p>
          <p data-slot="address" style="margin:8px 0 0;font-family:${FONT};font-size:12px;line-height:18px;color:${t.muted};text-align:center;">${escapeHtml(v.address).replace(/\n/g, ', ')}</p>
          <p style="margin:8px 0 0;text-align:center;"><a href="${escapeHtml(v.unsubUrl)}" style="font-family:${FONT};font-size:12px;line-height:18px;color:${t.muted};text-decoration:underline;">Unsubscribe</a></p>
          <p data-slot="copyright" style="margin:12px 0 0;font-family:${FONT};font-size:12px;line-height:18px;color:#696967;text-align:center;">${textToHtml(v.copyright)}</p>`
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${t.footerBg};${topStroke}"><tr><td style="padding:24px 40px;">${inner}</td></tr></table>`
    },
  },
  {
    id: 'disclosure',
    name: 'Disclosure',
    description: 'SEC-grade legal small print — always sits directly before the footer, on the footer surface.',
    audience: 'all',
    variants: [
      { id: 'default', name: 'Top stroke' },
      { id: 'no-stroke', name: 'No stroke' },
    ],
    slots: [
      { key: 'legal', label: 'Legal text', type: 'longtext', default: 'For informational purposes only and intended for approved users. This message does not constitute an offer to sell or a solicitation of an offer to buy any security. Any offer will be made only pursuant to definitive offering documents and applicable disclosures. Past performance is not indicative of future results. Investing involves risk, including the possible loss of principal.' },
      {
        key: 'paddingBottom',
        label: 'Bottom padding',
        type: 'select',
        default: '0',
        options: [
          { value: '0', label: '0px' },
          { value: '24', label: '24px' },
        ],
      },
    ],
    toHtml: (v, variant, theme) => {
      const t = T(theme)
      // Spec: 12px #AAAAAA on dark; darker equivalents on light surfaces for readability.
      const color = theme === 'dark' ? '#AAAAAA' : theme === 'cream' ? '#696967' : '#7A7A75'
      // Centered-only (mirrors the footer); legacy left/centered ids all resolve here.
      const noStroke = variant.includes('no-stroke')
      const align = 'center'
      const topStroke = noStroke ? '' : `border-top:1px solid ${t.footerBorder};`
      const padBottom = v.paddingBottom === '24' ? 24 : 0
      const inner = `<div data-slot="legal" data-rich="1" style="margin:0;font-family:${FONT};font-size:12px;line-height:18px;color:${color};text-align:${align};">${richToHtml(v.legal, T(theme).link)}</div>`
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${t.footerBg};${topStroke}"><tr><td style="padding:24px 40px ${padBottom}px;">${inner}</td></tr></table>`
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
        <h3 data-slot="title" style="margin:0 0 8px;font-family:${FONT};font-size:20px;line-height:22px;font-weight:normal;color:${t.heading};">${textToHtml(v.title)}</h3>
        <div data-slot="text" data-rich="1" style="margin:0;font-family:${FONT};font-size:16px;line-height:24px;color:${t.body};">${richToHtml(v.text, t.link)}</div>
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
      { id: 'amber', name: 'Amber' },
      { id: 'gold', name: 'Gold' },
      { id: 'amethyst', name: 'Amethyst' },
      { id: 'salmon', name: 'Salmon' },
      { id: 'chili', name: 'Chili' },
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
      // Light-colored cards carry ink content + dark pill; dark cards flip to cream content + gold pill.
      const isDark = !isLightHex(card.solid)
      const titleColor = isDark ? '#FFFFFF' : '#161616'
      const bodyColor = isDark ? 'rgba(250,245,230,0.8)' : 'rgba(22,22,22,0.8)'
      const pillBorder = isDark ? 'rgba(250,245,230,0.24)' : 'rgba(22,22,22,0.24)'
      const pill = `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="border:1px solid ${pillBorder};border-radius:16px;padding:8px 12px;font-family:${BTN_FONT};font-size:14px;line-height:16px;font-weight:500;text-transform:uppercase;color:${bodyColor};"><span data-slot="eyebrow">${textToHtml(v.eyebrow)}</span></td></tr></table>`
      // Spec pairing: dark surface → cream pill; light/colored surface → dark pill.
      const btn = isDark
        ? pillButton(v.ctaLabel, v.ctaUrl, '#E8D4A6', '#E8D4A6', '#1A1A1A', 'rgba(250,240,225,0.04)', false, 'ctaLabel')
        : pillButton(v.ctaLabel, v.ctaUrl, '#1A1A1A', '#1A1A1A', '#FAF5E6', 'rgba(250,240,225,0.04)', false, 'ctaLabel')
      const inner = `${pill}
        <h2 data-slot="title" style="margin:24px 0 16px;font-family:${FONT};font-size:32px;line-height:36px;font-weight:normal;color:${titleColor};">${textToHtml(v.title)}</h2>
        <div data-slot="text" data-rich="1" style="margin:0 0 24px;font-family:${FONT};font-size:16px;line-height:24px;color:${bodyColor};">${richToHtml(v.text, isDark ? '#2CD4D4' : '#1A1A1A')}</div>
        ${btn}`
      const cardHtml = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${card.solid}" style="background:${card.bg};border:1px solid rgba(250,240,225,0.15);border-radius:16px;padding:32px;">${inner}</td></tr></table>`
      return section(t.bg, cardHtml, '24px 40px')
    },
  },
  {
    id: 'card-numbered',
    name: 'Icon card',
    description: 'Step card with an accent icon badge — for sequences, features and how-it-works.',
    audience: 'marketing',
    variants: [
      { id: 'sapphire', name: 'Sapphire' },
      { id: 'emerald', name: 'Emerald' },
      { id: 'turquoise', name: 'Turquoise' },
      { id: 'amber', name: 'Amber' },
      { id: 'gold', name: 'Gold' },
      { id: 'amethyst', name: 'Amethyst' },
      { id: 'salmon', name: 'Salmon' },
      { id: 'chili', name: 'Chili' },
    ],
    slots: [
      { key: 'icon', label: 'Icon', type: 'select', default: DEFAULT_ICON, options: iconOptions() },
      { key: 'shape', label: 'Badge shape', type: 'select', default: 'rounded', options: [
        { value: 'rounded', label: 'Rounded' },
        { value: 'circle', label: 'Circular' },
      ] },
      { key: 'title', label: 'Title', type: 'text', default: 'Title Goes Here' },
      { key: 'titleSize', label: 'Title size', type: 'select', default: 'normal', options: [
        { value: 'small', label: 'Small (24px)' },
        { value: 'normal', label: 'Normal (32px)' },
        { value: 'big', label: 'Big (44px)' },
      ] },
      { key: 'text', label: 'Text', type: 'longtext', default: 'A short paragraph describing this step.' },
    ],
    toHtml: (v, variant, theme) => {
      const t = T(theme)
      const a = accentFor((variant as AccentId) in ACCENTS ? (variant as AccentId) : 'sapphire', theme)
      // Card surface per Figma: #161616 dark / #FFFBF0 cream / #F5F5F2 light,
      // with the accent "glow" (20% blurred ellipse, top-right) approximated as a gradient.
      const cardBg = theme === 'dark' ? '#161616' : theme === 'cream' ? '#F5F0E1' : '#F5F5F2'
      const glow = `background-image:linear-gradient(to bottom left, ${a.glow}, rgba(0,0,0,0) 55%);`
      const iconId = v.icon || DEFAULT_ICON
      const radius = v.shape === 'circle' ? '19px' : '8px'
      const icon = iconDataUri(iconId, a.main)
      const badge = `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="38" height="38" align="center" valign="middle" style="background-color:${a.bg};border:1px solid ${a.main};border-radius:${radius};"><img src="${icon}" width="22" height="22" alt="" style="display:block;width:22px;height:22px;border:0;" /></td></tr></table>`
      const titlePx = HEADING_SIZES[v.titleSize] ?? HEADING_SIZES.normal
      const card = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${cardBg}" style="background-color:${cardBg};${glow}border:1px solid rgba(250,240,225,0.04);border-radius:24px;padding:24px;">
        ${badge}
        <h3 data-slot="title" style="margin:16px 0 8px;font-family:${FONT};font-size:${titlePx}px;line-height:${Math.round(titlePx * 1.12)}px;letter-spacing:${-Math.round(titlePx * 2.5) / 100}px;font-weight:normal;color:${t.heading};">${textToHtml(v.title)}</h3>
        <div data-slot="text" data-rich="1" style="margin:0;font-family:${FONT};font-size:16px;line-height:24px;color:${t.body};">${richToHtml(v.text, t.link)}</div>
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
      { id: 'amber', name: 'Amber' },
      { id: 'gold', name: 'Gold' },
      { id: 'amethyst', name: 'Amethyst' },
      { id: 'salmon', name: 'Salmon' },
      { id: 'chili', name: 'Chili' },
      { id: 'dark', name: 'Dark' },
      { id: 'cream', name: 'Cream' },
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
        <td valign="middle" style="padding:0 0 12px;font-family:${FONT};font-size:16px;line-height:24px;color:${label};"><span data-slot="label">${textToHtml(v.label)}</span> &bull; <span data-slot="description" style="color:${t.note};">${textToHtml(v.description)}</span></td>
        <td align="right" valign="middle" style="padding:0 0 12px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right"><tr><td style="background-color:${a.bg};border:1px solid ${a.deep};border-radius:8px;padding:6px 10px;font-family:${FONT};font-size:14px;line-height:16px;color:${a.deep};"><span data-slot="tag">${textToHtml(v.tag)}</span></td></tr></table></td>
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
