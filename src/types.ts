import type { ThemeId } from './lib/brand'

export type SlotType = 'text' | 'longtext' | 'image' | 'url' | 'select'

export interface SlotOption {
  value: string
  label: string
}

export interface SlotDef {
  key: string
  label: string
  type: SlotType
  default: string
  options?: SlotOption[]
  help?: string
}

export interface ModuleVariant {
  id: string
  name: string
}

export type ModuleAudience = 'all' | 'marketing'

export interface ModuleDef {
  id: string
  name: string
  description: string
  audience: ModuleAudience
  variants: ModuleVariant[]
  slots: SlotDef[]
  /** Hide the generic Dark/Cream/Light surface control — module ignores inst.color (e.g. Signature). */
  themeless?: boolean
  /** Email-safe table HTML — single source of truth for canvas preview and export. */
  toHtml: (values: Record<string, string>, variantId: string, theme: ThemeId) => string
}

export interface ModuleInstance {
  uid: string
  moduleId: string
  variantId: string
  color: ThemeId
  values: Record<string, string>
}

export type TemplateKind = 'marketing' | 'transactional'

export interface EmailTemplate {
  id: string
  name: string
  kind: TemplateKind
  theme: ThemeId
  subject: string
  preheader: string
  modules: ModuleInstance[]
  updatedAt: number
}

export type SignatureBg = 'dark' | 'cream' | 'light' | 'none'

export interface Signature {
  id: string
  label: string // internal name for the entry (not shown in the signature itself)
  name: string
  title: string
  email: string
  website: string
  background: SignatureBg
  logo?: 'gold' | 'ink' // logomark override; falls back to the background's default
  updatedAt: number
}

export type { ThemeId }
