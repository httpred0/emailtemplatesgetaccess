import { useMemo, useRef, useState } from 'react'
import { Signature, SignatureBg } from '../types'
import { renderSignatureBlock, renderSignatureHtml } from '../lib/signature'
import { downloadHtml, slugify } from '../lib/exportHtml'
import { useStore } from '../store'

const BACKGROUNDS: { id: SignatureBg; name: string }[] = [
  { id: 'none', name: 'No background' },
  { id: 'dark', name: 'Dark' },
  { id: 'cream', name: 'Cream' },
  { id: 'light', name: 'Light' },
]

/** Preview canvas background per signature background, matching the email page surfaces. */
const CANVAS_BG: Record<SignatureBg, string> = {
  none: '#ededed',
  dark: '#0d0d0d',
  cream: '#fafafa',
  light: 'linear-gradient(80deg,#f4f4f2 50.64%,#f8f8ed 140.84%)',
}

export function SignatureBuilder({ signatureId, onBack }: { signatureId: string; onBack: () => void }) {
  const { signatures, updateSignature } = useStore()
  const sig = signatures.find((s) => s.id === signatureId)
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<number>()

  if (!sig) {
    return (
      <div className="inspector-placeholder">
        Signature not found. <button className="btn btn--small" onClick={onBack}>Back</button>
      </div>
    )
  }

  const html = useMemo(() => renderSignatureBlock(sig), [sig])

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(renderSignatureHtml(sig))
      setCopied(true)
      window.clearTimeout(copyTimer.current)
      copyTimer.current = window.setTimeout(() => setCopied(false), 1600)
    } catch {
      downloadHtml(`signature-${slugify(sig.label)}`, renderSignatureHtml(sig))
    }
  }

  const field = (key: keyof Signature, label: string) => (
    <div className="field">
      <label>{label}</label>
      <input type="text" value={sig[key] as string} onChange={(e) => updateSignature(sig.id, { [key]: e.target.value })} />
    </div>
  )

  return (
    <>
      <header className="topbar">
        <button className="btn btn--small btn--ghost" onClick={onBack}>
          ← Library
        </button>
        <input
          className="name-input"
          value={sig.label}
          onChange={(e) => updateSignature(sig.id, { label: e.target.value })}
          aria-label="Signature name"
        />
        <span className="kicker">Signature</span>
        <div className="topbar__spacer" />
        <button className="btn btn--small" onClick={copyHtml}>
          {copied ? 'Copied ✓' : 'Copy HTML'}
        </button>
        <button className="btn btn--gold btn--small" onClick={() => downloadHtml(`signature-${slugify(sig.label)}`, renderSignatureHtml(sig))}>
          Export HTML
        </button>
      </header>

      <div className="builder builder--signature">
        <div
          className="canvas-wrap"
          style={{ background: CANVAS_BG[sig.background] }}
        >
          <div className="sig-preview" dangerouslySetInnerHTML={{ __html: html }} />
        </div>

        <aside className="pane">
          <div className="pane__section">
            <h3>Details</h3>
            {field('name', 'Name')}
            {field('title', 'Title & company')}
            {field('email', 'Email')}
            {field('website', 'Website')}
          </div>
          <div className="pane__section">
            <h3>Background</h3>
            <div className="variant-row">
              {BACKGROUNDS.map((b) => (
                <button
                  key={b.id}
                  className={`chip ${sig.background === b.id ? 'is-active' : ''}`}
                  onClick={() => updateSignature(sig.id, { background: b.id })}
                >
                  {b.name}
                </button>
              ))}
            </div>
            <p className="field__help">
              Cream and Light carry the same card stroke as the email cards; No background is transparent for
              pasting into any client’s signature settings.
            </p>
          </div>
          <div className="pane__section">
            <h3>Logomark</h3>
            <div className="variant-row">
              {([
                { id: 'gold', name: 'Gold gradient' },
                { id: 'ink', name: 'Dark' },
              ] as const).map((l) => {
                const effective = sig.logo ?? (sig.background === 'dark' ? 'gold' : 'ink')
                return (
                  <button
                    key={l.id}
                    className={`chip ${effective === l.id ? 'is-active' : ''}`}
                    onClick={() => updateSignature(sig.id, { logo: l.id })}
                  >
                    {l.name}
                  </button>
                )
              })}
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
