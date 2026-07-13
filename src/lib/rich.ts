import { escapeHtml } from './brand'

/**
 * Limited rich text for email copy.
 *
 * Storage format: plain text plus a small whitelist of literal tags —
 * <b> <i> <a href="…"> <ul> <ol> <li> <br> — everything else renders escaped.
 * The renderer escapes the whole value first, then un-escapes only the
 * whitelist, so legacy plain-text values (and anything typed in the raw
 * panel) stay safe.
 */
export function richToHtml(s: string, linkColor: string): string {
  let out = escapeHtml(s)
  out = out
    .replace(/&lt;(\/?)(b|strong)&gt;/gi, '<$1b>')
    .replace(/&lt;(\/?)(i|em)&gt;/gi, '<$1i>')
    .replace(/&lt;br\s*\/?&gt;/gi, '<br />')
    .replace(/&lt;(\/?)(ul|ol)&gt;/gi, (_m, close, tag) =>
      close ? `</${tag}>` : `<${tag} style="margin:8px 0;padding-left:24px;">`,
    )
    .replace(/&lt;(\/?)li&gt;/gi, (_m, close) => (close ? '</li>' : '<li style="margin:4px 0;">'))
    .replace(/&lt;a href=&quot;(.*?)&quot;&gt;/gi, `<a href="$1" style="color:${linkColor};text-decoration:underline;">`)
    .replace(/&lt;\/a&gt;/gi, '</a>')
  // newlines outside lists become hard breaks
  out = out.replace(/\n/g, '<br />')
  return out
}

/** Serialize an edited contentEditable element back to the limited storage format. */
export function serializeRichElement(root: HTMLElement): string {
  const ser = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? '').replace(/ /g, ' ')
    if (!(node instanceof HTMLElement)) return ''
    const kids = [...node.childNodes].map(ser).join('')
    switch (node.tagName) {
      case 'B':
      case 'STRONG':
        return kids ? `<b>${kids}</b>` : ''
      case 'I':
      case 'EM':
        return kids ? `<i>${kids}</i>` : ''
      case 'A':
        return `<a href="${node.getAttribute('href') ?? ''}">${kids}</a>`
      case 'UL':
        return `<ul>${kids}</ul>`
      case 'OL':
        return `<ol>${kids}</ol>`
      case 'LI':
        return `<li>${kids}</li>`
      case 'BR':
        return '\n'
      case 'DIV':
      case 'P':
        return kids + '\n'
      default:
        return kids
    }
  }
  return ser(root).replace(/\n+$/, '')
}
