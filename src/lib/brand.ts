import logoRaw from '../assets/logo-lockup.svg?raw'
import markGoldRaw from '../assets/logomark-gold.svg?raw'
import markDarkRaw from '../assets/logomark-dark.svg?raw'

/**
 * Get Access email design system — extracted 1:1 from the Figma file
 * "DS - Get Access Foundation" → Emails → RawComponents.
 *
 * Every module renders against one of three surface themes (Dark / Cream / Light),
 * exactly as modeled in Figma. These values are LOCKED; editors never touch them.
 */

export type ThemeId = 'dark' | 'cream' | 'light'

export interface Theme {
  id: ThemeId
  name: string
  bg: string
  heading: string
  body: string
  muted: string
  note: string
  divider: string
  link: string
  codeBg: string
  codeBorder: string
  codeChar: string
  calloutBg: string
  calloutBorder: string
  calloutText: string
  btnPrimaryBg: string
  btnPrimarySolid: string
  btnPrimaryText: string
  btnSecondaryBg: string
  btnSecondaryText: string
  btnSecondaryBorder: string
  footerBg: string
  footerBorder: string
  footerLink: string
  cardBg: string
  cardBorder: string
  logo: 'gold' | 'ink'
}

export const THEMES: Record<ThemeId, Theme> = {
  dark: {
    id: 'dark',
    name: 'Dark',
    bg: '#161616',
    heading: '#FFFFFF',
    body: '#D1D1CC',
    muted: '#A6A6A1',
    note: '#7A7A75',
    divider: '#2B2B29',
    link: '#2CD4D4',
    codeBg: 'rgba(247,240,219,0.04)',
    codeBorder: 'rgba(250,240,225,0.15)',
    codeChar: '#FFFFFF',
    calloutBg: 'rgba(235,212,171,0.04)',
    calloutBorder: '#ECD4AB',
    calloutText: '#A6A6A1',
    btnPrimaryBg: '#E8D4A6',
    btnPrimarySolid: '#E8D4A6',
    btnPrimaryText: '#1A1A1A',
    btnSecondaryBg: 'rgba(247,240,219,0.08)',
    btnSecondaryText: '#ECD4AB',
    btnSecondaryBorder: 'rgba(250,240,225,0.15)',
    footerBg: '#1B1B1B',
    footerBorder: '#2B2B29',
    footerLink: '#E5E5E0',
    cardBg: '#1C1C1C',
    cardBorder: 'rgba(250,240,225,0.15)',
    logo: 'gold',
  },
  cream: {
    id: 'cream',
    name: 'Cream',
    bg: '#FAF5E6',
    heading: '#0D0D0D',
    body: '#2B2B29',
    muted: '#3D3D3B',
    note: '#696967',
    divider: '#D1D1CC',
    link: '#1A1A1A',
    codeBg: '#F4EBDD',
    codeBorder: '#A6A6A1',
    codeChar: '#0D0D0D',
    calloutBg: 'rgba(37,170,170,0.08)',
    calloutBorder: '#25AAAA',
    calloutText: '#3D3D3B',
    btnPrimaryBg: '#1A1A1A',
    btnPrimarySolid: '#1A1A1A',
    btnPrimaryText: '#FAF5E6',
    btnSecondaryBg: 'rgba(22,22,22,0.12)',
    btnSecondaryText: '#0D0D0D',
    btnSecondaryBorder: 'rgba(22,22,22,0.0)',
    footerBg: '#F3EEDF',
    footerBorder: '#D1D1CC',
    footerLink: '#161616',
    cardBg: '#F3EEDF',
    cardBorder: 'rgba(22,22,22,0.08)',
    logo: 'ink',
  },
  light: {
    id: 'light',
    name: 'Light',
    bg: '#FFFFFF',
    heading: '#0D0D0D',
    body: '#2B2B29',
    muted: '#3D3D3B',
    note: '#696967',
    divider: '#D1D1CC',
    link: '#1A1A1A',
    codeBg: '#FFFFFF',
    codeBorder: '#A6A6A1',
    codeChar: '#0D0D0D',
    calloutBg: 'rgba(37,170,170,0.08)',
    calloutBorder: '#25AAAA',
    calloutText: '#3D3D3B',
    btnPrimaryBg: '#1A1A1A',
    btnPrimarySolid: '#1A1A1A',
    btnPrimaryText: '#FAF5E6',
    btnSecondaryBg: 'rgba(22,22,22,0.12)',
    btnSecondaryText: '#0D0D0D',
    btnSecondaryBorder: 'rgba(22,22,22,0.0)',
    footerBg: '#F7F7F7',
    footerBorder: '#D1D1CC',
    footerLink: '#161616',
    cardBg: '#F7F7F7',
    cardBorder: 'rgba(22,22,22,0.08)',
    logo: 'ink',
  },
}

/**
 * Accent colors used by CardNumbered / HighlightItem (from Figma).
 * Surface-aware per the design system: bright tones on dark, deeper tones on cream/light
 * so they stay readable. `glow` mirrors the 20%-opacity blurred ellipse;
 * `deep` is the extra-dark tone Figma uses for small tag text on light surfaces.
 */
export interface AccentTone {
  main: string
  bg: string
  glow: string
  deep: string
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
function rgba(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r},${g},${b},${a})`
}
function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex).map((c) => Math.round(c * (1 - amount)))
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('').toUpperCase()}`
}
/** Build a surface-aware accent from a single brand hex; light-surface tone is darkened for contrast. */
function accent(mainDark: string, mainLight = darken(mainDark, 0.28)): { dark: AccentTone; light: AccentTone } {
  return {
    dark: { main: mainDark, bg: rgba(mainDark, 0.12), glow: rgba(mainDark, 0.2), deep: mainDark },
    light: { main: mainLight, bg: rgba(mainDark, 0.12), glow: rgba(mainLight, 0.2), deep: mainLight },
  }
}

export const ACCENTS = {
  // Dark tone = bright brand hex (reads on dark surfaces). Light tone = a deepened
  // version tuned for ~AA contrast of 14px text / 1px borders on cream & white.
  sapphire: {
    dark: { main: '#2DAEDE', bg: 'rgba(42,140,174,0.12)', glow: 'rgba(45,174,222,0.2)', deep: '#2DAEDE' },
    light: { main: '#136580', bg: 'rgba(24,132,172,0.12)', glow: 'rgba(19,101,128,0.2)', deep: '#136580' },
  },
  emerald: {
    dark: { main: '#B2DF99', bg: 'rgba(178,223,153,0.12)', glow: 'rgba(178,223,153,0.2)', deep: '#B2DF99' },
    light: { main: '#457035', bg: 'rgba(178,223,153,0.12)', glow: 'rgba(69,112,53,0.2)', deep: '#457035' },
  },
  turquoise: {
    dark: { main: '#47CCBF', bg: 'rgba(37,170,170,0.12)', glow: 'rgba(71,204,191,0.2)', deep: '#25AAAA' },
    light: { main: '#1E6E6E', bg: 'rgba(37,170,170,0.12)', glow: 'rgba(30,110,110,0.2)', deep: '#1E6E6E' },
  },
  // Extended palette (bright hex on dark; hand-deepened tone on cream/light).
  amber: accent('#F27E49', '#A84E22'),
  gold: accent('#F7BE62', '#7A5A1E'),
  amethyst: accent('#8F7997', '#5E4A66'),
  salmon: accent('#FF717F', '#A83A48'),
  chili: accent('#E53622', '#B42615'),
  // Neutral treatments (no theme adaptation): ink for light surfaces, cream for dark.
  dark: {
    dark: { main: '#2B2B29', bg: 'rgba(22,22,22,0.06)', glow: 'rgba(22,22,22,0.2)', deep: '#2B2B29' },
    light: { main: '#2B2B29', bg: 'rgba(22,22,22,0.06)', glow: 'rgba(22,22,22,0.2)', deep: '#2B2B29' },
  },
  cream: {
    dark: { main: '#E8D4A6', bg: 'rgba(232,212,166,0.12)', glow: 'rgba(232,212,166,0.2)', deep: '#E8D4A6' },
    light: { main: '#E8D4A6', bg: 'rgba(232,212,166,0.12)', glow: 'rgba(232,212,166,0.2)', deep: '#E8D4A6' },
  },
} as const satisfies Record<string, { dark: AccentTone; light: AccentTone }>

export type AccentId = keyof typeof ACCENTS

export function accentFor(id: AccentId, theme: ThemeId): AccentTone {
  return theme === 'dark' ? ACCENTS[id].dark : ACCENTS[id].light
}

/**
 * Card-glow gradient for the Icon card. Always uses the VIVID accent hue (not the
 * deepened text tone), and pushes strength/reach up on cream & light so the accent
 * reads over a near-white surface the way it does on the dark card.
 */
export function accentGlow(id: AccentId, theme: ThemeId): string {
  const vivid = ACCENTS[id].dark.main // bright hue, good as a background wash on any surface
  const strength = theme === 'dark' ? 0.22 : 0.55
  const stop = theme === 'dark' ? 55 : 72
  return `linear-gradient(to bottom left, ${rgba(vivid, strength)}, rgba(0,0,0,0) ${stop}%)`
}

/** BannerCTA card fills (from Figma, plus a dark card and the extended palette). */
export const BANNER_CARDS = {
  cream: { bg: 'linear-gradient(180deg,#DFC8A1 0%,#F6E6CA 100%)', solid: '#E9D6B2' },
  dark: { bg: '#161616', solid: '#161616' },
  turquoise: { bg: '#47CCBF', solid: '#47CCBF' },
  emerald: { bg: '#B2DF99', solid: '#B2DF99' },
  sapphire: { bg: '#2DAEDE', solid: '#2DAEDE' },
  amber: { bg: '#F27E49', solid: '#F27E49' },
  gold: { bg: '#F7BE62', solid: '#F7BE62' },
  amethyst: { bg: '#8F7997', solid: '#8F7997' },
  salmon: { bg: '#FF717F', solid: '#FF717F' },
  chili: { bg: '#E53622', solid: '#E53622' },
} as const
export type BannerCardId = keyof typeof BANNER_CARDS

/** Perceived brightness of a solid hex (0–1); used to pick ink vs cream content on colored cards. */
export function isLightHex(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5
}

/** Everything email-side renders in Arial — the email-safe brand typeface. */
export const FONT = 'Arial, Helvetica, sans-serif'
export const BTN_FONT = FONT

/** Gold 300 — the designated accent for eyebrow labels across the system (all themes). */
export const EYEBROW_GOLD = '#C0A968'

/**
 * Base URL for hosted brand assets (PNGs under public/brand/). When set, rendered/exported
 * HTML references absolute PNG URLs so the logo, logomark and icons show in Outlook, Gmail
 * and HubSpot (which strip inline SVG data-URIs). Set empty to embed data-URIs instead
 * (offline/dev). Regenerate the PNGs with scripts/rasterize-*.mjs after changing brand art.
 */
export const ASSET_BASE = 'https://emailtemplatesgetaccess.vercel.app'

/** Logo lockup — hosted PNG when ASSET_BASE is set, else inline SVG (gold for dark, ink for light). */
export function logoDataUri(kind: 'gold' | 'ink'): string {
  if (ASSET_BASE) return `${ASSET_BASE}/brand/logo-lockup-${kind}.png`
  const svg = kind === 'gold' ? logoRaw : logoRaw.replace(/fill="url\(#paint[^"]*\)"/g, 'fill="#161616"')
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/** Standalone logomark (starburst, 30×28) — hosted PNG when ASSET_BASE is set, else inline SVG. */
export function markDataUri(kind: 'gold' | 'ink'): string {
  if (ASSET_BASE) return `${ASSET_BASE}/brand/logomark-${kind}.png`
  return `data:image/svg+xml,${encodeURIComponent(kind === 'gold' ? markGoldRaw : markDarkRaw)}`
}

/** Brand-style "aura" placeholder image (blurred orb) as an SVG data URI. */
export function auraPlaceholder(w: number, h: number, dark = true): string {
  const bg = dark ? '#161616' : '#FAF5E6'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${bg}"/><defs><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${Math.round(Math.min(w, h) / 9)}"/></filter></defs><g filter="url(#b)"><ellipse cx="${w * 0.42}" cy="${h * 0.38}" rx="${w * 0.2}" ry="${h * 0.34}" fill="#EBD4AB"/><ellipse cx="${w * 0.55}" cy="${h * 0.6}" rx="${w * 0.18}" ry="${h * 0.32}" fill="#308081"/><ellipse cx="${w * 0.66}" cy="${h * 0.42}" rx="${w * 0.15}" ry="${h * 0.28}" fill="#CC9854"/></g><ellipse cx="${w / 2}" cy="${h / 2}" rx="${Math.min(w, h) * 0.42}" ry="${Math.min(w, h) * 0.42}" fill="none" stroke="#C09A6A" stroke-opacity="0.5"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** Escape + preserve line breaks. Merge tags like {{first_name}} pass through untouched. */
export function textToHtml(s: string): string {
  return escapeHtml(s).replace(/\n/g, '<br />')
}
