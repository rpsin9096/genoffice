import { describe, expect, it } from 'vitest'
import { openPptx, type TextElement } from '@genoffice/pptx-engine'
import { HeuristicMetrics } from '@genoffice/pptx-render'
import { buildPagePptx, parsePageSpec } from '../src/slides/page-spec'

const EMU_PER_PX = 9525
const deps = { fetchImage: async () => null, fontMetrics: new HeuristicMetrics() }

const undersized = {
  type: 'text' as const,
  x: 100,
  y: 100,
  w: 600,
  h: 30,
  paragraphs: [{ runs: [{ text: 'Fisiopatologia da inflamação aguda', sizePt: 40, bold: true }] }],
}

describe('study mode does not grow text boxes (ADR-S6)', () => {
  it('keeps layout: study_* on parse', () => {
    const r = parsePageSpec(JSON.stringify({ layout: 'study_title', elements: [undersized] }))
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.spec.layout).toBe('study_title')
  })

  it('does not stretch a study_title box that is shorter than its glyphs', async () => {
    const { bytes } = await buildPagePptx({ layout: 'study_title', elements: [undersized] }, deps)
    const opened = await openPptx(bytes)
    const el = opened.deck.slides[0]!.elements.find((e): e is TextElement => e.type === 'text')!
    expect(el.transform.offset.cy).toBe(30 * EMU_PER_PX)
  })

  it('still grows a marketing page without study_ layout', async () => {
    const { bytes } = await buildPagePptx({ elements: [undersized] }, deps)
    const opened = await openPptx(bytes)
    const el = opened.deck.slides[0]!.elements.find((e): e is TextElement => e.type === 'text')!
    expect(el.transform.offset.cy).toBeGreaterThan(30 * EMU_PER_PX)
  })
})
