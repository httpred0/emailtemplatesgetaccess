import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import { EmailTemplate, ModuleInstance, TemplateKind, ThemeId } from './types'
import { MODULES, moduleById, defaultValues } from './modules/registry'
import seedData from './data/seed-templates.json'

const STORAGE_KEY = 'ga-email-templates-v3'
const OLD_STORAGE_KEYS = ['ga-email-templates-v2', 'ga-email-templates-v1']

let counter = 0
export const uid = (): string => `${Date.now().toString(36)}-${(counter++).toString(36)}-${Math.random().toString(36).slice(2, 7)}`

function instanceOf(
  moduleId: string,
  color: ThemeId = 'dark',
  variantId?: string,
  values?: Record<string, string>,
): ModuleInstance {
  const mod = moduleById(moduleId)!
  return {
    uid: uid(),
    moduleId,
    variantId: variantId ?? mod.variants[0].id,
    color,
    values: { ...defaultValues(mod), ...values },
  }
}


/**
 * Starter library — Pedro's templates, captured from the live app on 2026-07-09
 * ("make it permanent"). To refresh: edit templates in the app, then POST the
 * library to /__save-seeds (see vite.config.ts) and this file is rewritten.
 */
function seedTemplates(): EmailTemplate[] {
  const now = Date.now()
  return (seedData as EmailTemplate[]).map((t) => ({ ...t, updatedAt: now }))
}

/** Spec order: the disclosure (SEC-grade legal) comes BEFORE the footer, not after it. */
export function reorderDisclosure(mods: ModuleInstance[]): ModuleInstance[] {
  const footerIdx = mods.findIndex((m) => m.moduleId === 'footer')
  if (footerIdx === -1) return mods
  const late = mods.filter((m, i) => m.moduleId === 'disclosure' && i > footerIdx)
  if (!late.length) return mods
  const rest = mods.filter((m) => !late.includes(m))
  rest.splice(rest.findIndex((m) => m.moduleId === 'footer'), 0, ...late)
  return rest
}

/**
 * Heal stored slot values whose module default changed after templates were saved.
 * Each entry maps a superseded default string to its replacement; only exact
 * matches of the old default are rewritten, so genuine edits are never clobbered.
 */
const VALUE_MIGRATIONS: Record<string, Record<string, [string, string]>> = {
  footer: {
    contact: ['Questions? concierge@getaccess.com', 'concierge@getaccess.com'],
  },
  disclosure: {
    legal: [
      'For informational purposes only and intended for approved users. This message does not constitute an offer to sell or a solicitation of an offer to buy any security.',
      'For informational purposes only and intended for approved users. This message does not constitute an offer to sell or a solicitation of an offer to buy any security. Any offer will be made only pursuant to definitive offering documents and applicable disclosures. Past performance is not indicative of future results. Investing involves risk, including the possible loss of principal.',
    ],
  },
}

function migrateModule(m: ModuleInstance): ModuleInstance {
  let out = m
  // Value-level heals (footer contact, disclosure legal, …).
  const fields = VALUE_MIGRATIONS[m.moduleId]
  if (fields) {
    for (const [key, [from, to]] of Object.entries(fields)) {
      if (out.values[key] === from) out = { ...out, values: { ...out.values, [key]: to } }
    }
  }
  // Icon card was "Numbered card": a legacy `number` digit becomes the matching circle-number icon.
  if (out.moduleId === 'card-numbered' && !out.values.icon) {
    const num = out.values.number
    const icon = num && /^[0-9]$/.test(num) ? `circle-number-${num}` : 'bolt'
    const { number, ...rest } = out.values
    out = { ...out, values: { ...rest, icon, shape: 'rounded' } }
  }
  return out
}

/** The retired Hero module expands into logo + full-width image + centered heading. */
function migrateTemplate(t: EmailTemplate): EmailTemplate {
  const withModules = (mods: ModuleInstance[]) => reorderDisclosure(mods.map(migrateModule))
  if (!t.modules.some((m) => m.moduleId === 'hero')) return { ...t, modules: withModules(t.modules) }
  return {
    ...t,
    modules: withModules(
      t.modules.flatMap((m) => {
        if (m.moduleId !== 'hero') return [m]
        const imageValues = m.values.image ? { image: m.values.image } : undefined
        return [
          instanceOf('logo-heading', m.color),
          instanceOf('image', m.color, 'full', imageValues),
          instanceOf('heading', m.color, m.variantId === 'eyebrow' ? 'centered-eyebrow' : 'centered', {
            eyebrow: m.values.eyebrow ?? '',
            title: m.values.title ?? '',
          }),
        ]
      }),
    ),
  }
}

/** Load templates: prefer v3; migrate any user-made templates from older keys, then add missing starters. */
function loadTemplates(): EmailTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return (JSON.parse(raw) as EmailTemplate[]).map(migrateTemplate)
  } catch {
    /* corrupted — fall through to seed */
  }
  const seeds = seedTemplates().map(migrateTemplate)
  for (const key of OLD_STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const old = JSON.parse(raw) as EmailTemplate[]
      // keep anything the user made themselves (old auto-seeds ended in "— sample")
      const userMade = old.filter((t) => !t.name.endsWith('— sample')).map(migrateTemplate)
      return [...userMade, ...seeds]
    } catch {
      /* skip bad key */
    }
  }
  return seeds
}

interface Store {
  templates: EmailTemplate[]
  createTemplate: (kind: TemplateKind) => EmailTemplate
  duplicateTemplate: (id: string) => EmailTemplate | undefined
  updateTemplate: (id: string, patch: Partial<EmailTemplate>) => void
  deleteTemplate: (id: string) => void
  newInstance: typeof instanceOf
}

const StoreCtx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<EmailTemplate[]>(loadTemplates)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
    } catch {
      /* quota exceeded (large uploaded images) — keep working in memory */
    }
  }, [templates])

  const store = useMemo<Store>(
    () => ({
      templates,
      createTemplate: (kind) => {
        const t: EmailTemplate = {
          id: uid(),
          name: kind === 'marketing' ? 'Untitled campaign' : 'Untitled transactional',
          kind,
          theme: 'dark',
          subject: '',
          preheader: '',
          modules: [instanceOf('logo-heading'), instanceOf('divider'), instanceOf('disclosure'), instanceOf('footer')],
          updatedAt: Date.now(),
        }
        setTemplates((p) => [t, ...p])
        return t
      },
      duplicateTemplate: (id) => {
        const src = templates.find((t) => t.id === id)
        if (!src) return undefined
        const copy: EmailTemplate = {
          ...src,
          id: uid(),
          name: `${src.name} (copy)`,
          modules: src.modules.map((m) => ({ ...m, uid: uid(), values: { ...m.values } })),
          updatedAt: Date.now(),
        }
        setTemplates((p) => [copy, ...p])
        return copy
      },
      updateTemplate: (id, patch) =>
        setTemplates((p) => p.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t))),
      deleteTemplate: (id) => setTemplates((p) => p.filter((t) => t.id !== id)),
      newInstance: instanceOf,
    }),
    [templates],
  )

  return <StoreCtx.Provider value={store}>{children}</StoreCtx.Provider>
}

export function useStore(): Store {
  const s = useContext(StoreCtx)
  if (!s) throw new Error('useStore outside StoreProvider')
  return s
}

export { MODULES }
