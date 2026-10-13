/** 16:9 canvas + type-floor oracle. Empty list means the deck may be written. */
import type { StudyPageSpec } from './compile'
import { CANVAS_H, CANVAS_W, inToPx, TYPE_FLOOR_PT } from './geometry'
import type { ContrastPair } from './painter'

export const STUDY_CANVAS_PX = { w: inToPx(CANVAS_W), h: inToPx(CANVAS_H) }

export interface VisualFail {
  slide: number
  module: string
  code: 'off_canvas' | 'type_floor'
  required?: number
}

export function visualFailures(
  page: StudyPageSpec,
  meta: { slide?: number; module?: string } = {},
): VisualFail[] {
  const slide = meta.slide ?? 0
  const module = meta.module ?? page.module
  const out: VisualFail[] = []
  const { w: cw, h: ch } = STUDY_CANVAS_PX
  for (const el of page.elements) {
    if (el.x < 0 || el.y < 0 || el.x + el.w > cw || el.y + el.h > ch) {
      out.push({ slide, module, code: 'off_canvas' })
    }
    if (el.type === 'text') {
      for (const para of el.paragraphs) {
        for (const run of para.runs) {
          if (run.sizePt < TYPE_FLOOR_PT) {
            out.push({ slide, module, code: 'type_floor', required: TYPE_FLOOR_PT })
          }
        }
      }
    }
  }
  return out
}

export function deckVisualFailures(
  results: readonly { page: StudyPageSpec; pairs?: readonly ContrastPair[] }[],
): VisualFail[] {
  return results.flatMap((r, i) =>
    visualFailures(r.page, { slide: i + 1, module: r.page.module }),
  )
}
