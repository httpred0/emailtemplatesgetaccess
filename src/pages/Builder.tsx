import { useEffect, useMemo, useRef, useState } from 'react'
import { ModuleInstance, SlotDef, ThemeId } from '../types'
import { MODULES, moduleById } from '../modules/registry'
import { THEMES } from '../lib/brand'
import { serializeRichElement } from '../lib/rich'
import { renderModuleBlock, renderEmailHtml, downloadHtml, slugify, renderSingleModuleHtml } from '../lib/exportHtml'
import { useStore, reorderDisclosure } from '../store'

const THEME_IDS: ThemeId[] = ['dark', 'cream', 'light']

export function Builder({ templateId, onBack }: { templateId: string; onBack: () => void }) {
  const { templates, updateTemplate, newInstance } = useStore()
  const template = templates.find((t) => t.id === templateId)
  const [selectedUid, setSelectedUid] = useState<string | null>(null)
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop')
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<number>()

  if (!template) {
    return (
      <div className="inspector-placeholder">
        Template not found. <button className="btn btn--small" onClick={onBack}>Back</button>
      </div>
    )
  }

  const selected = template.modules.find((m) => m.uid === selectedUid) ?? null
  const availableModules = MODULES.filter((m) => template.kind === 'marketing' || m.audience === 'all')

  // the disclosure always stays directly before the footer, whatever the edit
  const patchModules = (modules: ModuleInstance[]) => updateTemplate(template.id, { modules: reorderDisclosure(modules) })

  const setTheme = (theme: ThemeId) => {
    updateTemplate(template.id, {
      theme,
      modules: template.modules.map((m) => ({ ...m, color: theme })),
    })
  }

  const addModule = (moduleId: string) => {
    const inst = newInstance(moduleId, template.theme)
    const mods = [...template.modules]
    // keep the legal tail (disclosure → footer) at the end
    let insertAt = mods.length
    while (insertAt > 0 && ['footer', 'disclosure'].includes(mods[insertAt - 1].moduleId) && !['footer', 'disclosure'].includes(moduleId)) {
      insertAt--
    }
    mods.splice(insertAt, 0, inst)
    patchModules(mods)
    setSelectedUid(inst.uid)
  }

  const move = (uidToMove: string, dir: -1 | 1) => {
    const mods = [...template.modules]
    const i = mods.findIndex((m) => m.uid === uidToMove)
    const j = i + dir
    if (i < 0 || j < 0 || j >= mods.length) return
    ;[mods[i], mods[j]] = [mods[j], mods[i]]
    patchModules(mods)
  }

  const remove = (uidToRemove: string) => {
    patchModules(template.modules.filter((m) => m.uid !== uidToRemove))
    if (selectedUid === uidToRemove) setSelectedUid(null)
  }

  const duplicate = (uidToCopy: string) => {
    const mods = [...template.modules]
    const i = mods.findIndex((m) => m.uid === uidToCopy)
    if (i < 0) return
    const copy: ModuleInstance = { ...mods[i], uid: `${mods[i].uid}-c${Date.now().toString(36)}`, values: { ...mods[i].values } }
    mods.splice(i + 1, 0, copy)
    patchModules(mods)
    setSelectedUid(copy.uid)
  }

  const updateSelected = (patch: Partial<ModuleInstance>) => {
    if (!selected) return
    patchModules(template.modules.map((m) => (m.uid === selected.uid ? { ...m, ...patch } : m)))
  }

  const updateInstanceValue = (uid: string, key: string, value: string) => {
    patchModules(template.modules.map((m) => (m.uid === uid ? { ...m, values: { ...m.values, [key]: value } } : m)))
  }

  const exportTemplate = () => {
    const html = renderEmailHtml(template)
    if (/(?:src|background)="data:image\//.test(html)) {
      const ok = confirm(
        'This email contains embedded images (uploads, placeholders or the logo).\n\nMost inboxes (Gmail, Outlook) block embedded images — for production sends, host your images online and paste their https URLs into the image fields.\n\nExport anyway?',
      )
      if (!ok) return
    }
    downloadHtml(slugify(template.name), html)
  }

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(renderEmailHtml(template))
      setCopied(true)
      window.clearTimeout(copyTimer.current)
      copyTimer.current = window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard unavailable — fall back to download */
      downloadHtml(slugify(template.name), renderEmailHtml(template))
    }
  }

  return (
    <>
      <header className="topbar">
        <button className="btn btn--small btn--ghost" onClick={onBack}>
          ← Library
        </button>
        <input
          className="name-input"
          value={template.name}
          onChange={(e) => updateTemplate(template.id, { name: e.target.value })}
          aria-label="Template name"
        />
        <span className="kicker">{template.kind}</span>
        <div className="topbar__spacer" />
        <div className="seg" role="group" aria-label="Email theme">
          {THEME_IDS.map((th) => (
            <button key={th} className={template.theme === th ? 'is-active' : ''} onClick={() => setTheme(th)} title={`Set all modules to ${THEMES[th].name}`}>
              {THEMES[th].name}
            </button>
          ))}
        </div>
        <div className="seg" role="group" aria-label="Preview width">
          <button className={viewport === 'desktop' ? 'is-active' : ''} onClick={() => setViewport('desktop')}>
            Desktop
          </button>
          <button className={viewport === 'mobile' ? 'is-active' : ''} onClick={() => setViewport('mobile')}>
            Mobile
          </button>
        </div>
        <button className="btn btn--small" onClick={copyHtml}>
          {copied ? 'Copied ✓' : 'Copy HTML'}
        </button>
        <button className="btn btn--gold btn--small" onClick={exportTemplate}>
          Export HTML
        </button>
      </header>

      <div className="builder">
        <aside className="pane">
          <div className="pane__section">
            <h3>Modules</h3>
            <p className="pane__hint">Click to add to the email.</p>
            <div className="palette">
              {availableModules.map((m) => (
                <button key={m.id} className="palette__item" onClick={() => addModule(m.id)}>
                  <b>
                    {m.name}
                    {m.audience === 'marketing' && <i className="palette__badge">MKT</i>}
                  </b>
                  <span>
                    {m.variants.length} variation{m.variants.length > 1 ? 's' : ''}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="pane__section">
            <h3>Email settings</h3>
            <div className="field">
              <label>Subject line</label>
              <input
                type="text"
                value={template.subject}
                onChange={(e) => updateTemplate(template.id, { subject: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Preheader</label>
              <input
                type="text"
                value={template.preheader}
                onChange={(e) => updateTemplate(template.id, { preheader: e.target.value })}
              />
              <div className="field__help">The short line shown after the subject in the inbox.</div>
            </div>
          </div>
          <div className="pane__section">
            <h3>Before sending</h3>
            <p className="pane__note">
              Images must be hosted online — most inboxes block embedded uploads and placeholders. Upload
              your images to your CDN or ESP (HubSpot / Resend both host files) and paste the https URL
              into the image field.
            </p>
          </div>
        </aside>

        <div className="canvas-wrap" onClick={() => setSelectedUid(null)} data-theme={template.theme}>
          {selected && (
            <div className="fmt-bar" onMouseDown={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()}>
              <span className="fmt-bar__hint">Select text in the preview, then:</span>
              <button className="fmt-btn" title="Bold" onClick={() => document.execCommand('bold')}>
                <b>B</b>
              </button>
              <button className="fmt-btn" title="Italic" onClick={() => document.execCommand('italic')}>
                <i>I</i>
              </button>
              <button
                className="fmt-btn"
                title="Link"
                onClick={() => {
                  const url = prompt('Link URL (https://…)')
                  if (url) document.execCommand('createLink', false, url)
                }}
              >
                Link
              </button>
              <button className="fmt-btn" title="Bullet list" onClick={() => document.execCommand('insertUnorderedList')}>
                • List
              </button>
            </div>
          )}
          <div className={`canvas ${viewport === 'mobile' ? 'is-mobile' : ''}`}>
            {template.modules.length === 0 && (
              <div className="canvas-empty">Add a module from the left to begin.</div>
            )}
            <div className="canvas-card">
              {template.modules.map((inst, i) => (
                <CanvasBlock
                  key={inst.uid}
                  inst={inst}
                  isSelected={inst.uid === selectedUid}
                  isFirst={i === 0}
                  isLast={i === template.modules.length - 1}
                  onSelect={() => setSelectedUid(inst.uid)}
                  onMoveUp={() => move(inst.uid, -1)}
                  onMoveDown={() => move(inst.uid, 1)}
                  onDuplicate={() => duplicate(inst.uid)}
                  onRemove={() => remove(inst.uid)}
                  onValue={(key, value) => updateInstanceValue(inst.uid, key, value)}
                />
              ))}
            </div>
          </div>
        </div>

        <aside className="pane">
          {selected ? (
            <Inspector
              key={selected.uid}
              inst={selected}
              onChange={updateSelected}
              onExport={() => {
                const mod = moduleById(selected.moduleId)
                downloadHtml(
                  `module-${slugify(mod?.name ?? selected.moduleId)}`,
                  renderSingleModuleHtml(selected, mod?.name ?? 'Module'),
                )
              }}
            />
          ) : (
            <div className="inspector-placeholder">
              Select a module on the canvas to edit its content, variation and color.
            </div>
          )}
        </aside>
      </div>
    </>
  )
}

function CanvasBlock({
  inst,
  isSelected,
  isFirst,
  isLast,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
  onValue,
}: {
  inst: ModuleInstance
  isSelected: boolean
  isFirst: boolean
  isLast: boolean
  onSelect: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onRemove: () => void
  onValue: (key: string, value: string) => void
}) {
  const mod = moduleById(inst.moduleId)
  const html = useMemo(() => renderModuleBlock(inst), [inst])
  const contentRef = useRef<HTMLDivElement>(null)

  // Inline editing: text elements carry data-slot; they become editable while the block is selected.
  useEffect(() => {
    const root = contentRef.current
    if (!root) return
    root.querySelectorAll<HTMLElement>('[data-slot]').forEach((el) => {
      el.setAttribute('contenteditable', isSelected ? 'true' : 'false')
      el.style.outline = 'none'
      if (isSelected) el.style.cursor = 'text'
      else el.style.removeProperty('cursor')
    })
  }, [html, isSelected])

  const syncEdit = (target: EventTarget | null) => {
    const el = (target as HTMLElement | null)?.closest?.('[data-slot]') as HTMLElement | null
    if (!el || !el.dataset.edited) return
    delete el.dataset.edited
    const key = el.dataset.slot!
    const value = el.dataset.rich ? serializeRichElement(el) : el.innerText.replace(/\n+$/, '')
    if (value !== (inst.values[key] ?? '')) onValue(key, value)
  }

  return (
    <div
      className={`canvas-block ${isSelected ? 'is-selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
    >
      <div
        ref={contentRef}
        dangerouslySetInnerHTML={{ __html: html }}
        onInput={(e) => {
          const el = (e.target as HTMLElement).closest?.('[data-slot]') as HTMLElement | null
          if (el) el.dataset.edited = '1'
        }}
        onBlur={(e) => syncEdit(e.target)}
        onClickCapture={(e) => {
          // links in the canvas must never navigate
          if ((e.target as HTMLElement).closest?.('a')) e.preventDefault()
        }}
      />
      <div className="canvas-block__overlay" />
      <span className="canvas-block__label">{mod?.name ?? inst.moduleId}</span>
      <div className="canvas-block__tools" onClick={(e) => e.stopPropagation()}>
        <button className="tool-btn" title="Move up" disabled={isFirst} onClick={onMoveUp}>
          ↑
        </button>
        <button className="tool-btn" title="Move down" disabled={isLast} onClick={onMoveDown}>
          ↓
        </button>
        <button className="tool-btn" title="Duplicate" onClick={onDuplicate}>
          ⧉
        </button>
        <button className="tool-btn" title="Remove" onClick={onRemove}>
          ✕
        </button>
      </div>
    </div>
  )
}

function Inspector({
  inst,
  onChange,
  onExport,
}: {
  inst: ModuleInstance
  onChange: (patch: Partial<ModuleInstance>) => void
  onExport: () => void
}) {
  const mod = moduleById(inst.moduleId)
  if (!mod) return null

  const setValue = (key: string, value: string) => onChange({ values: { ...inst.values, [key]: value } })

  return (
    <>
      <div className="pane__section">
        <h3>{mod.name}</h3>
        {mod.variants.length > 1 && (
          <div className="field">
            <label>Variation</label>
            <div className="variant-row">
              {mod.variants.map((v) => (
                <button
                  key={v.id}
                  className={`chip ${v.id === inst.variantId ? 'is-active' : ''}`}
                  onClick={() => onChange({ variantId: v.id })}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="field">
          <label>Color</label>
          <div className="variant-row">
            {THEME_IDS.map((th) => (
              <button
                key={th}
                className={`chip ${th === inst.color ? 'is-active' : ''}`}
                onClick={() => onChange({ color: th })}
              >
                {THEMES[th].name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {mod.slots.length > 0 && (
        <div className="pane__section">
          <h3>Content</h3>
          {mod.slots.map((slot) => (
            <SlotField key={slot.key} slot={slot} value={inst.values[slot.key] ?? slot.default} onChange={(v) => setValue(slot.key, v)} />
          ))}
        </div>
      )}

      <div className="pane__section">
        <button className="btn btn--small" onClick={onExport}>
          Export this module
        </button>
      </div>
    </>
  )
}

function SlotField({ slot, value, onChange }: { slot: SlotDef; value: string; onChange: (v: string) => void }) {
  if (slot.type === 'longtext') {
    return (
      <div className="field">
        <label>{slot.label}</label>
        <textarea value={value} onChange={(e) => onChange(e.target.value)} />
        {slot.help && <div className="field__help">{slot.help}</div>}
      </div>
    )
  }
  if (slot.type === 'select' && slot.options) {
    return (
      <div className="field">
        <label>{slot.label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {slot.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    )
  }
  if (slot.type === 'image') {
    return (
      <div className="field img-slot">
        <label>{slot.label}</label>
        <img src={value} alt="" className="img-slot__thumb" />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = () => onChange(String(reader.result))
            reader.readAsDataURL(file)
          }}
        />
        <input
          type="url"
          placeholder="…or paste an image URL"
          onChange={(e) => e.target.value && onChange(e.target.value)}
        />
        <div className="field__help">
          For real sends, use a hosted https image URL — most inboxes block embedded uploads.
        </div>
      </div>
    )
  }
  return (
    <div className="field">
      <label>{slot.label}</label>
      <input type={slot.type === 'url' ? 'url' : 'text'} value={value} onChange={(e) => onChange(e.target.value)} />
      {slot.help && <div className="field__help">{slot.help}</div>}
    </div>
  )
}
