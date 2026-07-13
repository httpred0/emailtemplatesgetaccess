/**
 * Icon set for the Icon card module — Tabler-style 24×24 SVGs.
 * Source strokes/fills are authored in #ECD4AB; recolored per accent at render time.
 */
const raw = import.meta.glob('../assets/icons/*.svg', { eager: true, query: '?raw', import: 'default' }) as Record<
  string,
  string
>

const TOKEN = /#ECD4AB/gi

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

/** Recolored icon as a data URI (both stroke- and fill-authored icons handled). */
export function iconDataUri(id: string, color: string): string {
  const icon = byId.get(id) ?? byId.get(DEFAULT_ICON)
  if (!icon) return ''
  const svg = icon.svg.replace(TOKEN, color)
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export function iconOptions(): { value: string; label: string }[] {
  return ICONS.map((i) => ({ value: i.id, label: i.name }))
}
