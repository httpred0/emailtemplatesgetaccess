import { useState } from 'react'
import { EmailTemplate, ModuleDef, TemplateKind, ThemeId } from '../types'
import { MODULES, defaultValues } from '../modules/registry'
import { THEMES } from '../lib/brand'
import { renderModuleBlock, renderSingleModuleHtml, renderCanvasHtml, downloadHtml, slugify } from '../lib/exportHtml'
import { useStore, uid } from '../store'
import logo from '../assets/logo-lockup.svg'

type Tab = 'marketing' | 'transactional' | 'modules'

const THEME_IDS: ThemeId[] = ['dark', 'cream', 'light']

const TAB_TITLES: Record<Tab, string> = {
  marketing: 'Marketing emails',
  transactional: 'Transactional emails',
  modules: 'Module library',
}

export function Home({ onOpen }: { onOpen: (id: string) => void }) {
  const { templates, createTemplate, duplicateTemplate, deleteTemplate } = useStore()
  const [tab, setTab] = useState<Tab>('marketing')

  const counts: Record<Tab, number> = {
    marketing: templates.filter((t) => t.kind === 'marketing').length,
    transactional: templates.filter((t) => t.kind === 'transactional').length,
    modules: MODULES.length,
  }

  const startTemplate = (kind: TemplateKind) => {
    const t = createTemplate(kind)
    onOpen(t.id)
  }

  return (
    <>
      <header className="topbar">
        <img src={logo} alt="Get Access" className="topbar__logo" />
        <span className="topbar__title">Email Studio</span>
        <div className="topbar__spacer" />
        <button
          className="btn btn--gold"
          onClick={() => startTemplate(tab === 'transactional' ? 'transactional' : 'marketing')}
        >
          New template
        </button>
      </header>

      <nav className="tabs" aria-label="Library sections">
        {(['marketing', 'transactional', 'modules'] as Tab[]).map((t) => (
          <button key={t} className={`tab ${tab === t ? 'is-active' : ''}`} onClick={() => setTab(t)}>
            {t}
            <span className="tab__count">{counts[t]}</span>
          </button>
        ))}
      </nav>

      <main className="gallery">
        <div className="gallery__head">
          <h2>{TAB_TITLES[tab]}</h2>
        </div>

        {tab === 'modules' ? (
          <div className="module-list">
            {MODULES.map((m) => (
              <ModuleRow key={m.id} mod={m} />
            ))}
          </div>
        ) : (
          <TemplateGrid
            templates={templates.filter((t) => t.kind === tab)}
            kind={tab}
            onOpen={onOpen}
            onNew={() => startTemplate(tab)}
            onDuplicate={(id) => duplicateTemplate(id)}
            onDelete={(id) => deleteTemplate(id)}
          />
        )}
      </main>
    </>
  )
}

function TemplateGrid({
  templates,
  kind,
  onOpen,
  onNew,
  onDuplicate,
  onDelete,
}: {
  templates: EmailTemplate[]
  kind: TemplateKind
  onOpen: (id: string) => void
  onNew: () => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="grid">
      <button className="card card--new" onClick={onNew}>
        <span className="plus">+</span>
        <span>Blank {kind === 'marketing' ? 'campaign' : 'transactional email'}</span>
      </button>
      {templates.map((t) => (
        <article className="card" key={t.id}>
          <div className="card__preview" onClick={() => onOpen(t.id)} title="Open in builder">
            <div className="card__preview-inner" dangerouslySetInnerHTML={{ __html: renderCanvasHtml(t) }} />
          </div>
          <div className="card__body">
            <button className="card__name" onClick={() => onOpen(t.id)}>
              {t.name}
            </button>
            <span className="card__meta">
              {t.modules.length} modules · {THEMES[t.theme]?.name ?? 'Dark'} · updated {new Date(t.updatedAt).toLocaleDateString()}
            </span>
            <div className="card__actions">
              <button className="btn btn--small" onClick={() => onOpen(t.id)}>
                Edit
              </button>
              <button className="btn btn--small btn--ghost" onClick={() => onDuplicate(t.id)}>
                Duplicate
              </button>
              <button
                className="btn btn--small btn--ghost btn--danger"
                onClick={() => {
                  if (confirm(`Delete "${t.name}"?`)) onDelete(t.id)
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function ModuleRow({ mod }: { mod: ModuleDef }) {
  const [variantId, setVariantId] = useState(mod.variants[0].id)
  const [color, setColor] = useState<ThemeId>('dark')
  const html = renderModuleBlock({ uid: 'preview', moduleId: mod.id, variantId, color, values: defaultValues(mod) })

  return (
    <section className="module-row" id={`module-${mod.id}`}>
      <header className="module-row__head">
        <h3 className="module-row__name">
          {mod.name}
          {mod.audience === 'marketing' && <i className="palette__badge">MKT</i>}
        </h3>
        <div className="module-row__controls">
          {mod.variants.length > 1 && (
            <div className="module-row__chips" role="group" aria-label="Variations">
              {mod.variants.map((v) => (
                <button
                  key={v.id}
                  className={`chip ${v.id === variantId ? 'is-active' : ''}`}
                  onClick={() => setVariantId(v.id)}
                >
                  {v.name}
                </button>
              ))}
            </div>
          )}
          <div className="module-row__chips" role="group" aria-label="Colors">
            {THEME_IDS.map((th) => (
              <button key={th} className={`chip ${th === color ? 'is-active' : ''}`} onClick={() => setColor(th)}>
                {THEMES[th].name}
              </button>
            ))}
          </div>
          <button
            className="btn btn--small"
            onClick={() =>
              downloadHtml(
                `module-${slugify(mod.name)}-${slugify(variantId)}-${color}`,
                renderSingleModuleHtml({ uid: uid(), moduleId: mod.id, variantId, color, values: defaultValues(mod) }, mod.name),
              )
            }
          >
            Export HTML
          </button>
        </div>
      </header>
      <div className="module-row__stage">
        <div className="module-row__preview" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </section>
  )
}
