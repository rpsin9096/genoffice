import { describe, expect, it } from 'vitest'
import { compileDeck } from '../src/slides/study/compile'
import { CANVAS_H, CANVAS_W, inToPx, TYPE_FLOOR_PT } from '../src/slides/study/geometry'
import { deckVisualFailures, visualFailures } from '../src/slides/study/visual'
import { INFLAMACAO_MANIFEST } from './fixtures/inflamacao'
import type { StudyPageSpec } from '../src/slides/study/compile'

const CANVAS = { w: inToPx(CANVAS_W), h: inToPx(CANVAS_H) }

function page(over: Partial<StudyPageSpec> = {}): StudyPageSpec {
  return {
    background: '#F8F9FF',
    title: 'X',
    type: 'content',
    layout: 'study_definition',
    module: 'definition',
    tier: 'STANDARD',
    elements: [],
    ...over,
  }
}

describe('study visual oracle (16:9 + type floor)', () => {
  it('pins the study canvas to 1280x720 (16:9)', () => {
    expect(CANVAS).toEqual({ w: 1280, h: 720 })
    expect(CANVAS.w / CANVAS.h).toBeCloseTo(16 / 9, 10)
  })

  it('flags an element that walks off the canvas', () => {
    const fails = visualFailures(
      page({
        elements: [{ type: 'shape', shape: 'rect', x: 1200, y: 10, w: 200, h: 40, fill: '#000' }],
      }),
      { slide: 1, module: 'definition' },
    )
    expect(fails.some((f) => f.code === 'off_canvas')).toBe(true)
  })

  it('flags body type below TYPE_FLOOR_PT', () => {
    const fails = visualFailures(
      page({
        elements: [
          {
            type: 'text',
            x: 62,
            y: 56,
            w: 200,
            h: 40,
            paragraphs: [{ runs: [{ text: 'Hi', sizePt: TYPE_FLOOR_PT - 1, color: '#000', font: 'Montserrat' }] }],
          },
        ],
      }),
      { slide: 2, module: 'title' },
    )
    expect(fails.some((f) => f.code === 'type_floor' && f.required === TYPE_FLOOR_PT)).toBe(true)
  })

  it('lets the inflamacao deck write — zero visual failures', () => {
    expect(deckVisualFailures(compileDeck(INFLAMACAO_MANIFEST))).toEqual([])
  })
})
