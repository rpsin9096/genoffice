/** WCAG 2.1 contrast, ported from study-deck 3.zip contrast.py. */
import type { ContrastPair } from './painter'

export const WCAG_AA_TEXT = 4.5
export const WCAG_AA_DISPLAY = 3.0

function channel(v: number): number {
  const x = v / 255
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
}

function normHex(hexc: string): string {
  const h = hexc.replace(/^#/, '').toUpperCase()
  if (h.length === 3) return [...h].map((c) => c + c).join('')
  return h
}

export function relLum(hexc: string): number {
  const h = normHex(hexc)
  const r = channel(parseInt(h.slice(0, 2), 16))
  const g = channel(parseInt(h.slice(2, 4), 16))
  const b = channel(parseInt(h.slice(4, 6), 16))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(fg: string, bg: string): number {
  const [l1, l2] = [relLum(fg), relLum(bg)].sort((a, b) => b - a)
  return (l1 + 0.05) / (l2 + 0.05)
}

export function requiredRatio(sizePt: number, bold: boolean): number {
  return sizePt >= 18 || (bold && sizePt >= 14) ? WCAG_AA_DISPLAY : WCAG_AA_TEXT
}

export function pick(candidates: string[], surface: string, target: number): string | null {
  for (const cand of candidates) {
    if (cand && contrastRatio(cand, surface) >= target) return cand
  }
  return null
}

export function shadeUntil(
  hexcolor: string,
  surface: string,
  target: number,
  maxSteps = 12,
): string {
  let c = normHex(hexcolor)
  for (let step = 1; step <= maxSteps; step += 1) {
    const f = 1 - step * 0.07
    c = [0, 2, 4]
      .map((i) =>
        Math.max(0, Math.round(parseInt(c.slice(i, i + 2), 16) * f))
          .toString(16)
          .padStart(2, '0')
          .toUpperCase(),
      )
      .join('')
    if (contrastRatio(c, surface) >= target) return c
  }
  return c
}

export interface ContrastFail {
  slide: number
  module: string
  fg: string
  bg: string
  ratio: number
  required: number
}

function hex6(c: string): string {
  return c.replace(/^#/, '').toUpperCase()
}

/** Pairs below WCAG AA. Empty list means the deck may be written. */
export function contrastFailures(
  pairs: readonly ContrastPair[],
  meta: { slide?: number; module?: string } = {},
): ContrastFail[] {
  const slide = meta.slide ?? 0
  const module = meta.module ?? '?'
  const out: ContrastFail[] = []
  for (const e of pairs) {
    const need = requiredRatio(e.sizePt, e.bold)
    const r = contrastRatio(e.fg, e.bg)
    if (r < need) {
      out.push({
        slide,
        module,
        fg: hex6(e.fg),
        bg: hex6(e.bg),
        ratio: Math.round(r * 100) / 100,
        required: need,
      })
    }
  }
  return out
}

export function deckContrastFailures(
  results: readonly { pairs: readonly ContrastPair[]; page: { module: string } }[],
): ContrastFail[] {
  return results.flatMap((r, i) =>
    contrastFailures(r.pairs, { slide: i + 1, module: r.page.module }),
  )
}

/** Same format as 3.zip `render.failure_lines`. */
export function failureLines(fails: readonly ContrastFail[], limit = 8): string[] {
  return fails.slice(0, limit).map(
    (cf) =>
      `  X slide ${cf.slide} [${cf.module}]: #${hex6(cf.fg)} sobre #${hex6(cf.bg)} = ${cf.ratio} (requer ${cf.required})`,
  )
}
