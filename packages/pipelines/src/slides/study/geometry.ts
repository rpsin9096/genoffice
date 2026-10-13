/**
 * StudyDeck v3 canvas, density tiers and the one-shot measure (`tierFor`).
 * Numbers are canonical from study-deck 3.zip (`geometry.py`); do not "fix"
 * the asymmetric right edge — the 35 modules were calibrated against it.
 */

export const CANVAS_W = 13.333
export const CANVAS_H = 7.5
export const SAFE_X0 = 0.65
export const SAFE_Y0 = 1.55
export const CONTENT_W = 12.0
export const CONTENT_H = 5.05
export const FOOTER_Y = 6.98
export const FOOTNOTE_GUTTER = 0.1
export const CONTENT_BOTTOM = SAFE_Y0 + CONTENT_H
export const CONTENT_BAND_H = CONTENT_H - FOOTNOTE_GUTTER
export const HEADER_TITLE_H = 0.65
export const ELABORATION_H = 0.65

export const TYPE_FLOOR_PT = 9.0
export const BODY_FLOOR_PT = 10.5

export const DPI = 96

export interface Tier {
  readonly name: 'STANDARD' | 'COMPACT'
  readonly gap: number
  readonly pad: number
  readonly cap: number | null
  readonly scale: number
}

export const STANDARD: Tier = Object.freeze({
  name: 'STANDARD',
  gap: 0.16,
  pad: 0.25,
  cap: 1.2,
  scale: 1.0,
})

export const COMPACT: Tier = Object.freeze({
  name: 'COMPACT',
  gap: 0.1,
  pad: 0.18,
  cap: null,
  scale: 0.94,
})

export const CARD_INSET = 0.15
/** Largest of the two timeline card bands along the axis (diagram.py). */
export const CARD_SLOT = 2.05
export const TIMELINE_MAX = 5
/** Text band inside an etymology root card (card 1.85). */
export const ROOT_CARD_TEXT_H = 1.55

const CHAR_W = 0.57

/** Round inches onto the 1280×720 (96 dpi) GenOffice canvas. */
export function inToPx(inches: number): number {
  return Math.round(inches * DPI)
}

/**
 * Estimated height in inches. Tripwire for density, not a layout engine —
 * match studydeck.typography.est_height exactly so COMPACT fires on the same copy.
 */
export function estHeight(
  text: string,
  boxWIn: number,
  sizePt: number,
  lineSp = 1.34,
  spAfter = 3,
): number {
  if (!text) return 0
  const charWIn = (CHAR_W * sizePt) / 72
  const usable = Math.max(boxWIn - 0.3, 0.35)
  const perLine = Math.max(Math.trunc(usable / charWIn), 1)
  let lines = 0
  for (const raw of String(text).split('\n')) {
    lines += Math.max(1, Math.ceil(raw.length / perLine))
  }
  return (lines * (sizePt * lineSp)) / 72 + spAfter / 72
}

export function typePt(size: number, tier: Tier, long = false): number {
  if (tier.scale >= 1) return size
  const floor = long ? BODY_FLOOR_PT : TYPE_FLOOR_PT
  return Math.max(size * tier.scale, floor)
}

function rowHeight(texts: string[], boxW: number, size: number, tier: Tier): number {
  const pt = typePt(size, tier, true)
  let max = 0
  for (const t of texts) {
    const h = estHeight(t, boxW, pt)
    if (h > max) max = h
  }
  return max
}

/**
 * STANDARD if the copy fits the zone; COMPACT otherwise. One measurement.
 * Overflow after COMPACT is reported by fit, never a third tier.
 */
export function tierFor(texts: readonly string[], boxW: number, size: number, zoneH: number): Tier {
  const items = texts.map(String).filter((t) => t.length > 0)
  const n = Math.max(items.length, 1)
  const needed =
    n * rowHeight(items, boxW, size, STANDARD) +
    n * STANDARD.pad +
    Math.max(n - 1, 0) * STANDARD.gap
  return needed <= zoneH ? STANDARD : COMPACT
}

/** Horizontal sibling of stackLayout: item width and starting x. */
export function rowLayout(
  x0: number,
  totalW: number,
  n: number,
  gap: number,
  center = false,
): { itemW: number; x0: number } {
  const count = Math.max(n, 1)
  let itemW = Math.min((totalW - gap * (count - 1)) / count, totalW)
  let start = x0
  if (center) {
    itemW = Math.min(1.35, itemW)
    start = x0 + (totalW - (itemW * count + gap * (count - 1))) / 2
  }
  return { itemW, x0: start }
}

export function stackLayout(
  y0: number,
  zoneH: number,
  n: number,
  gap: number,
  cap?: number | null,
): { rowH: number; yFirst: number } {
  const count = Math.max(n, 1)
  let rowH = (zoneH - gap * (count - 1)) / count
  if (cap) rowH = Math.min(rowH, cap)
  const yFirst = y0 + (zoneH - (rowH * count + gap * (count - 1))) / 2
  return { rowH, yFirst }
}

export function tierForBlock(text: string, boxW: number, size: number, slotH: number): Tier {
  const needed = estHeight(String(text), boxW, typePt(size, STANDARD, true)) + 2 * CARD_INSET
  return needed <= slotH ? STANDARD : COMPACT
}

export function blockHeight(
  text: string,
  boxW: number,
  size: number,
  slotH: number,
  tier: Tier,
): number {
  const needed = estHeight(String(text), boxW, typePt(size, tier, true)) + 2 * CARD_INSET
  return Math.min(needed, slotH)
}
