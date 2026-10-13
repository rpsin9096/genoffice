import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { FIT_TOLERANCE, fitBoxes } from '../src/slides/study/contracts'
import { overflowsPainted } from '../src/slides/study/fit-drift'
import { lintDeck } from '../src/slides/study/lint'
import type { StudySlide } from '../src/slides/study/types'

function acceptsFit(slide: StudySlide): boolean {
  return !lintDeck([slide]).some((e) => e.includes('transbordo'))
}

function withField(base: StudySlide, field: string, text: string): StudySlide {
  return { ...base, [field]: text } as StudySlide
}

function largestAccepted(base: StudySlide, field: string, limit: number): number | null {
  let best: number | null = null
  for (let n = 20; n <= limit; n += 5) {
    if (!acceptsFit(withField(base, field, 'x'.repeat(n)))) break
    best = n
  }
  return best
}

const DEFINITION = {
  module: 'definition' as const,
  title: 'D',
  main_statement: 'x'.repeat(60),
  key_points: [
    { title: 'V', desc: 'd' },
    { title: 'W', desc: 'e' },
  ],
}

const QUOTE = {
  module: 'quote_block' as const,
  title: 'D',
  quote: 'x'.repeat(60),
  author: 'A',
}

const TITLE = { module: 'title' as const, title: 'x'.repeat(60) }

describe('fit drift (3.zip test_fit_drift)', () => {
  it('does not pass SAFE_X0/SAFE_Y0 as a width or height', () => {
    const src = readFileSync(resolve(__dirname, '../src/slides/study/modules.ts'), 'utf-8')
    const wHit = /\.(tx|rect|pill|placeImage)\(\s*[^,]+,\s*[^,]+,\s*(SAFE_X0|SAFE_Y0)\b/.exec(src)
    const hHit = /\.(tx|rect|pill|placeImage)\(\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*(SAFE_X0|SAFE_Y0)\b/.exec(
      src,
    )
    expect(wHit, `coordinate as width: ${wHit?.[0]}`).toBeNull()
    expect(hHit, `coordinate as height: ${hHit?.[0]}`).toBeNull()
  })

  it('exposes FIT_RULES boxes for the 3.zip measured modules', () => {
    const modules = [
      'title',
      'section_divider',
      'definition',
      'stat_card',
      'case_block',
      'quote_block',
      'socratic_question',
      'oxford_union',
      'viva_question',
      'authority_card',
      'evidence_card',
      'annotated_passage',
    ] as const
    for (const module of modules) {
      expect(fitBoxes({ module } as StudySlide).length, module).toBeGreaterThan(0)
    }
  })

  it('keeps the largest lint-accepted copy inside the painted box', () => {
    const drifted: string[] = []
    const cases: { base: StudySlide; field: string; limit: number }[] = [
      { base: TITLE as StudySlide, field: 'title', limit: 80 },
      { base: DEFINITION as StudySlide, field: 'main_statement', limit: 240 },
      { base: QUOTE as StudySlide, field: 'quote', limit: 260 },
    ]
    for (const { base, field, limit } of cases) {
      const n = largestAccepted(base, field, limit)
      expect(n, `${base.module}.${field} never accepted`).not.toBeNull()
      const over = overflowsPainted(withField(base, field, 'x'.repeat(n!)))
      for (const o of over) {
        drifted.push(
          `${base.module}.${o.field} @ ${n} car.: ${o.need.toFixed(2)}in > ${o.boxH.toFixed(2)}in`,
        )
      }
    }
    expect(drifted, drifted.join('; ')).toEqual([])
  })

  it('uses the 1.06 lint tolerance, not a third density tier', () => {
    expect(FIT_TOLERANCE).toBe(1.06)
  })
})
