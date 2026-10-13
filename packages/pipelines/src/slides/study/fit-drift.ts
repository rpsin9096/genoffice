/** Painted box vs lint FIT_RULES — 3.zip test_fit_drift, without python-pptx. */
import { compileSlide } from './compile'
import { fitBoxes } from './contracts'
import { DPI, estHeight } from './geometry'
import type { StudySlide } from './types'

/** Estimator slack from 3.zip test_density.OVERFLOW_MARGIN_IN. */
export const OVERFLOW_MARGIN_IN = 0.12

export interface PaintedOverflow {
  field: string
  need: number
  boxH: number
}

function fieldText(slide: StudySlide, field: string): string {
  return String((slide as unknown as Record<string, unknown>)[field] ?? '')
}

export function overflowsPainted(slide: StudySlide): PaintedOverflow[] {
  const { page } = compileSlide(slide, { course: 'Fisiopatologia', index: 1 })
  const out: PaintedOverflow[] = []
  for (const [field, , , sizePt] of fitBoxes(slide)) {
    const text = fieldText(slide, field)
    if (!text) continue
    const el = page.elements.find(
      (e) =>
        e.type === 'text' && e.paragraphs.some((p) => p.runs.some((r) => r.text === text)),
    )
    if (!el || el.type !== 'text') continue
    const paintedW = el.w / DPI
    const paintedH = el.h / DPI
    const run = el.paragraphs[0]?.runs.find((r) => r.text === text)
    const pt = run?.sizePt ?? sizePt
    const need = estHeight(text, paintedW, pt)
    if (need > paintedH + OVERFLOW_MARGIN_IN) {
      out.push({ field, need, boxH: paintedH })
    }
  }
  return out
}
