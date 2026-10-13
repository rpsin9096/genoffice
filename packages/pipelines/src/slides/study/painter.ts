/**
 * Shared canvas painter: shapes then text, contrast pairs as we go.
 * Inches in, 96-dpi page-spec out. The LLM never calls this.
 */
import { CONTENT_W, FOOTER_Y, HEADER_TITLE_H, SAFE_X0, inToPx } from './geometry'
import { classify, panelLabel } from './images'
import { UCP, UCP_TOKENS, ucpHex } from './palette-ucp'

export interface ContrastPair {
  fg: string
  bg: string
  sizePt: number
  bold: boolean
}

export interface SpecRun {
  text: string
  sizePt: number
  bold?: boolean
  italic?: boolean
  color: string
  font: string
}

export interface SpecParagraph {
  runs: SpecRun[]
  align?: 'left' | 'center' | 'right'
  lineSpacingPct?: number
}

export interface SpecShape {
  type: 'shape'
  shape: 'rect' | 'roundRect' | 'rightArrow' | 'ellipse'
  x: number
  y: number
  w: number
  h: number
  fill?: string
  stroke?: { color: string; widthPt: number }
}

export interface SpecText {
  type: 'text'
  x: number
  y: number
  w: number
  h: number
  valign?: 'top' | 'middle'
  paragraphs: SpecParagraph[]
}

export interface SpecImage {
  type: 'image'
  x: number
  y: number
  w: number
  h: number
  url: string
}

export type SpecElement = SpecShape | SpecText | SpecImage

const FONT = 'Montserrat'

function px(inches: number): number {
  return inToPx(inches)
}

function hash(hex6: string): string {
  return hex6.startsWith('#') ? hex6 : `#${hex6}`
}

export class Painter {
  elements: SpecElement[] = []
  pairs: ContrastPair[] = []

  rect(
    x: number,
    y: number,
    w: number,
    h: number,
    fill: string | null,
    opts?: { rounded?: boolean; stroke?: string; strokePt?: number; shape?: SpecShape['shape'] },
  ): void {
    const el: SpecShape = {
      type: 'shape',
      shape: opts?.shape ?? (opts?.rounded === false ? 'rect' : 'roundRect'),
      x: px(x),
      y: px(y),
      w: Math.max(px(w), 1),
      h: Math.max(px(h), 1),
    }
    if (fill) el.fill = hash(fill)
    if (opts?.stroke) el.stroke = { color: hash(opts.stroke), widthPt: opts.strokePt ?? 0.6 }
    this.elements.push(el)
  }

  tx(
    x: number,
    y: number,
    w: number,
    h: number,
    text: string,
    sizePt: number,
    color: string,
    surface: string,
    extra?: {
      bold?: boolean
      italic?: boolean
      align?: 'left' | 'center' | 'right'
      lineSp?: number
      valign?: 'top' | 'middle'
    },
  ): void {
    if (!text) return
    const fg = hash(color)
    const bgFill = hash(surface)
    this.pairs.push({ fg, bg: bgFill, sizePt, bold: extra?.bold === true })
    const para: SpecParagraph = {
      runs: [
        {
          text,
          sizePt,
          color: fg,
          font: FONT,
          ...(extra?.bold ? { bold: true } : {}),
          ...(extra?.italic ? { italic: true } : {}),
        },
      ],
    }
    if (extra?.align) para.align = extra.align
    if (extra?.lineSp) para.lineSpacingPct = Math.round(extra.lineSp * 100)
    this.elements.push({
      type: 'text',
      x: px(x),
      y: px(y),
      w: Math.max(px(w), 1),
      h: Math.max(px(h), 1),
      valign: extra?.valign ?? (extra?.align === 'center' ? 'middle' : 'top'),
      paragraphs: [para],
    })
  }

  pill(
    x: number,
    y: number,
    w: number,
    h: number,
    text: string,
    fill: string,
    fg: string,
    size = 9,
  ): void {
    this.rect(x, y, w, h, fill)
    this.tx(x, y, w, h, text, size, fg, fill, { bold: true, align: 'center', valign: 'middle' })
  }

  header(kicker: string | undefined, title: string): void {
    if (kicker) {
      this.tx(SAFE_X0, 0.32, 11.0, 0.24, kicker.toUpperCase(), 9.5, UCP_TOKENS.ink_accent, UCP.bg, {
        bold: true,
      })
    }
    this.tx(SAFE_X0, 0.58, CONTENT_W, HEADER_TITLE_H, title, 23, UCP.primary, UCP.bg, {
      bold: true,
    })
    this.rect(SAFE_X0, 1.28, 1.3, 0.03, UCP.accent, { rounded: false })
    this.rect(1.98, 1.29, 10.7, 0.01, UCP.border, { rounded: false })
  }

  footer(course: string, index: number): void {
    if (course) {
      this.tx(SAFE_X0, FOOTER_Y, 8.5, 0.28, course.toUpperCase(), 9, UCP.text_muted, UCP.bg)
    }
    this.tx(11.8, FOOTER_Y, 0.9, 0.28, String(index).padStart(2, '0'), 9, UCP.text_muted, UCP.bg, {
      align: 'right',
      bold: true,
    })
  }

  background(slot: 'bg' | 'primary' = 'bg'): string {
    return ucpHex(slot)
  }

  /** Local files become pixels; web / ai / placeholder stay a labeled panel. */
  placeImage(x: number, y: number, w: number, h: number, source: string): void {
    const { scheme, value } = classify(source)
    if (scheme === 'local') {
      this.elements.push({
        type: 'image',
        x: px(x),
        y: px(y),
        w: Math.max(px(w), 1),
        h: Math.max(px(h), 1),
        url: value,
      })
      return
    }
    this.rect(x, y, w, h, UCP.soft, { stroke: UCP.border, strokePt: 0.75 })
    this.tx(
      x + 0.2,
      y + h / 2 - 0.16,
      w - 0.4,
      0.32,
      panelLabel(scheme, value),
      9.5,
      UCP.text_muted,
      UCP.soft,
      { align: 'center', valign: 'middle' },
    )
  }
}
