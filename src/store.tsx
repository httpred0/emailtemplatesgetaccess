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

/** The retired Hero module expands into logo + full-width image + centered heading. */
function migrateTemplate(t: EmailTemplate): EmailTemplate {
  if (!t.modules.some((m) => m.moduleId === 'hero')) return t
  return {
    ...t,
    modules: t.modules.flatMap((m) => {
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
  const seeds = seedTemplates()
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
          modules: [instanceOf('logo-heading'), instanceOf('footer'), instanceOf('disclosure')],
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
