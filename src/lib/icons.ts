/**
 * Icon set for the Icon card module — Tabler-style 24×24 SVGs.
 * Source strokes/fills are authored in #ECD4AB; recolored per accent at render time.
 */
import { ASSET_BASE } from './brand'
import ICON_ASSET_COLORS from './icon-asset-colors.json'

const raw = import.meta.glob('../assets/icons/*.svg', { eager: true, query: '?raw', import: 'default' }) as Record<
  string,
  string
>

const TOKEN = /#ECD4AB/gi

/** Reverse of the shared color map: recolor hex -> hosted-PNG filename key (e.g. "#2DAEDE" -> "sapphire"). */
const HEX_TO_KEY = new Map(
  Object.entries(ICON_ASSET_COLORS as Record<string, string>).map(([key, hex]) => [hex.toLowerCase(), key]),
)

function prettify(id: string): string {
  const m = id.match(/^circle-number-(\d)$/)
  if (m) return `Number ${m[1]}`
  if (id === 'angellist') return 'AngelList'
  return id
    .replace(/-/g, ' ')
    .replace(/\balt\b/gi, '')
    .replace(/\bhour 4\b/gi, '')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export interface IconDef {
  id: string
  name: string
  svg: string
}

export const ICONS: IconDef[] = Object.entries(raw)
  .map(([path, svg]) => {
    const id = path.split('/').pop()!.replace('.svg', '').toLowerCase()
    return { id, name: prettify(id), svg }
  })
  .sort((a, b) => a.name.localeCompare(b.name))

const byId = new Map(ICONS.map((i) => [i.id, i]))

export const DEFAULT_ICON = 'bolt'

/** Recolored icon — hosted PNG when ASSET_BASE is set and the color is known, else inline SVG. */
export function iconDataUri(id: string, color: string): string {
  const icon = byId.get(id) ?? byId.get(DEFAULT_ICON)
  if (!icon) return ''
  if (ASSET_BASE) {
    const key = HEX_TO_KEY.get(color.toLowerCase())
    if (key) return `${ASSET_BASE}/brand/icons/${icon.id}__${key}.png`
    // Unknown color (not in the generated matrix) — fall back to inline SVG so nothing breaks.
  }
  const svg = icon.svg.replace(TOKEN, color)
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export function iconOptions(): { value: string; label: string }[] {
  return ICONS.map((i) => ({ value: i.id, label: i.name }))
}
