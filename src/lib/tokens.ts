/**
 * Provider-specific personalization tokens.
 *
 * Modules author neutral tokens like {{first_name}}. Each provider rewrites them to
 * its own syntax at export time. Resend keeps our neutral tokens (its variables use
 * exactly this shape); HubSpot maps them to native HubL contact tokens.
 *
 * To add a token: add one row to HUBSPOT_TOKENS. Nothing else changes.
 */
export type Provider = 'resend' | 'hubspot'

export const PROVIDERS: { id: Provider; name: string }[] = [
  { id: 'resend', name: 'Resend' },
  { id: 'hubspot', name: 'HubSpot' },
]

/** Neutral token name → HubSpot HubL expression. Unlisted tokens are left untouched. */
export const HUBSPOT_TOKENS: Record<string, string> = {
  first_name: 'contact.firstname',
  last_name: 'contact.lastname',
  full_name: 'contact.firstname ~ " " ~ contact.lastname',
  email: 'contact.email',
  company: 'company.name',
  job_title: 'contact.jobtitle',
  phone: 'contact.phone',
  city: 'contact.city',
}

/** Rewrite {{ token }} occurrences for the target provider. Whitespace inside braces is tolerated. */
export function transformTokens(html: string, provider: Provider): string {
  if (provider !== 'hubspot') return html // Resend uses our neutral {{token}} syntax as-is
  let out = html
  for (const [ours, hubl] of Object.entries(HUBSPOT_TOKENS)) {
    out = out.replace(new RegExp(`\\{\\{\\s*${ours}\\s*\\}\\}`, 'g'), `{{ ${hubl} }}`)
  }
  return out
}
