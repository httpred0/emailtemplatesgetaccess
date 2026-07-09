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
    link: '#ECD4AB',
    codeBg: 'rgba(247,240,219,0.04)',
    codeBorder: 'rgba(250,240,225,0.15)',
    codeChar: '#FFFFFF',
    calloutBg: 'rgba(235,212,171,0.04)',
    calloutBorder: '#ECD4AB',
    calloutText: '#A6A6A1',
    btnPrimaryBg: 'linear-gradient(180deg,#DFC8A1 0%,#F6E6CA 100%)',
    btnPrimarySolid: '#E9D6B2',
    btnPrimaryText: '#0D0D0D',
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
    link: '#308081',
    codeBg: '#F4EBDD',
    codeBorder: '#A6A6A1',
    codeChar: '#0D0D0D',
    calloutBg: 'rgba(37,170,170,0.08)',
    calloutBorder: '#25AAAA',
    calloutText: '#3D3D3B',
    btnPrimaryBg: '#161616',
    btnPrimarySolid: '#161616',
    btnPrimaryText: '#FFFFFF',
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
    link: '#308081',
    codeBg: '#FFFFFF',
    codeBorder: '#A6A6A1',
    codeChar: '#0D0D0D',
    calloutBg: 'rgba(37,170,170,0.08)',
    calloutBorder: '#25AAAA',
    calloutText: '#3D3D3B',
    btnPrimaryBg: '#161616',
    btnPrimarySolid: '#161616',
    btnPrimaryText: '#FFFFFF',
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
export const ACCENTS: Record<'sapphire' | 'emerald' | 'turquoise', { dark: AccentTone; light: AccentTone }> = {
  sapphire: {
    dark: { main: '#2DAEDE', bg: 'rgba(42,140,174,0.12)', glow: 'rgba(45,174,222,0.2)', deep: '#2DAEDE' },
    light: { main: '#1884AC', bg: 'rgba(24,132,172,0.12)', glow: 'rgba(24,132,172,0.2)', deep: '#1884AC' },
  },
  emerald: {
    dark: { main: '#B2DF99', bg: 'rgba(178,223,153,0.12)', glow: 'rgba(178,223,153,0.2)', deep: '#B2DF99' },
    light: { main: '#8FAD7E', bg: 'rgba(178,223,153,0.12)', glow: 'rgba(143,173,126,0.2)', deep: '#8FAD7E' },
  },
  turquoise: {
    dark: { main: '#47CCBF', bg: 'rgba(37,170,170,0.12)', glow: 'rgba(71,204,191,0.2)', deep: '#25AAAA' },
    light: { main: '#25AAAA', bg: 'rgba(37,170,170,0.12)', glow: 'rgba(37,170,170,0.2)', deep: '#308081' },
  },
} as const

export function accentFor(id: AccentId, theme: ThemeId): AccentTone {
  return theme === 'dark' ? ACCENTS[id].dark : ACCENTS[id].light
}
export type AccentId = keyof typeof ACCENTS

/** BannerCTA card fills (from Figma, plus a dark card). */
export const BANNER_CARDS = {
  cream: { bg: 'linear-gradient(180deg,#DFC8A1 0%,#F6E6CA 100%)', solid: '#E9D6B2' },
  dark: { bg: '#161616', solid: '#161616' },
  turquoise: { bg: '#47CCBF', solid: '#47CCBF' },
  emerald: { bg: '#B2DF99', solid: '#B2DF99' },
  sapphire: { bg: '#2DAEDE', solid: '#2DAEDE' },
} as const
export type BannerCardId = keyof typeof BANNER_CARDS

/** Everything email-side renders in Arial — the email-safe brand typeface. */
export const FONT = 'Arial, Helvetica, sans-serif'
export const BTN_FONT = FONT

/** Logo lockup (from the brand SVG package) as a data URI — gold gradient for dark, ink for light surfaces. */
export function logoDataUri(kind: 'gold' | 'ink'): string {
  const svg = kind === 'gold' ? logoRaw : logoRaw.replace(/fill="url\(#paint[^"]*\)"/g, 'fill="#161616"')
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/** Standalone logomark (starburst, 30×28) — gold gradient for dark footers, ink for cream/light. */
export function markDataUri(kind: 'gold' | 'ink'): string {
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
