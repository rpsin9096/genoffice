/** UCP brand slots from study-deck 3.zip palette.py. Author never picks text colour. */

import { pick, shadeUntil, WCAG_AA_TEXT } from './contrast'

export const UCP = {
  primary: '3854CC',
  accent: 'D92A2B',
  bg: 'F8F9FF',
  text: '2B2C4A',
  text_muted: '606383',
  alert: 'B91C1C',
  success: '1E8A5A',
  border: 'D9DDF2',
  card: 'FFFFFF',
  soft: 'EEF0FF',
  highlight: 'E0E4FF',
} as const

export type UcpSlot = keyof typeof UCP

export function ucpHex(slot: UcpSlot): string {
  return `#${UCP[slot]}`
}

function token(candidates: string[], surface: string, fallback: string): string {
  return pick(candidates, surface, WCAG_AA_TEXT) ?? shadeUntil(fallback, surface, WCAG_AA_TEXT)
}

const SOFT = UCP.soft
const PRIMARY = UCP.primary
const ACCENT = UCP.accent

export const UCP_TOKENS = {
  ink_accent: token([ACCENT], SOFT, ACCENT),
  on_primary: token([ACCENT, 'FFFFFF', UCP.highlight], PRIMARY, 'FFFFFF'),
  on_primary_soft: token([ACCENT, UCP.highlight, 'FFFFFF'], PRIMARY, 'FFFFFF'),
  subtitle_on_primary: token([UCP.highlight, 'FFFFFF'], PRIMARY, 'FFFFFF'),
  on_accent: token(['FFFFFF', UCP.text], ACCENT, UCP.text),
  on_success: token(['FFFFFF', UCP.text], UCP.success, UCP.text),
  on_alert: token(['FFFFFF', UCP.text], UCP.alert, UCP.text),
  ink_success: token([UCP.success], SOFT, UCP.success),
}

/** Readable foreground for text sitting on `fill`. */
export function inkOn(fill: string): string {
  return pick(['FFFFFF', UCP.text], fill, WCAG_AA_TEXT) ?? UCP.text
}

function hex6(c: string): string {
  return c.replace(/^#/, '').toUpperCase()
}

/** Closed set the compiler may paint. Brand slots + WCAG-derived text tokens. */
export function allowedPaintHexes(): Set<string> {
  const out = new Set<string>(['FFFFFF'])
  for (const v of Object.values(UCP)) out.add(hex6(v))
  for (const v of Object.values(UCP_TOKENS)) out.add(hex6(v))
  return out
}
