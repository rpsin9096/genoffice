import { describe, expect, it } from 'vitest'
import { compileSlide } from '../src/slides/study/compile'
import { lintDeck } from '../src/slides/study/lint'
import { parseStudyManifest } from '../src/slides/study/manifest'
import type { StudySlide } from '../src/slides/study/types'

const FIGURE = {
  module: 'figure' as const,
  kicker: 'Figura',
  title: 'Infiltrado neutrofílico',
  image: 'placeholder:corte HE',
  caption: 'Infiltrado neutrofílico no interstício alveolar.',
  credit: 'Robbins 10ed fig. 3-4',
}

const opts = { course: 'Fisiopatologia', index: 5 }

describe('compile figure (3.zip m_figure)', () => {
  it('emits study_figure and a labeled placeholder panel — never downloads', () => {
    const { page } = compileSlide(FIGURE as StudySlide, opts)
    expect(page.layout).toBe('study_figure')
    expect(page.module).toBe('figure')
    const blob = JSON.stringify(page)
    expect(blob).toContain('MARCADOR')
    expect(blob).toContain('corte HE')
    expect(blob).toContain('Infiltrado neutrofílico no interstício alveolar.')
    expect(page.elements.some((el) => el.type === 'image')).toBe(false)
  })

  it('labels https sources as FUENTE WEB instead of fetching them', () => {
    const { page } = compileSlide(
      { ...FIGURE, image: 'https://cdn.example.org/he.jpg' } as StudySlide,
      opts,
    )
    const blob = JSON.stringify(page)
    expect(blob).toContain('FUENTE WEB')
    expect(blob).toContain('https://cdn.example.org/he.jpg')
    expect(page.elements.some((el) => el.type === 'image')).toBe(false)
  })

  it('emits a local image element for a .png path', () => {
    const { page } = compileSlide({ ...FIGURE, image: 'work/imgs/he.png' } as StudySlide, opts)
    const img = page.elements.find((el) => el.type === 'image') as
      { type: 'image'; url: string } | undefined
    expect(img?.url).toBe('work/imgs/he.png')
  })

  it('lints required image/caption/credit and accepts a complete figure', () => {
    expect(lintDeck([FIGURE as StudySlide])).toEqual([])
    const errs = lintDeck([
      { module: 'figure', title: 'X', image: '', caption: '', credit: '' } as StudySlide,
    ])
    expect(errs.some((e) => e.includes('.image') && e.includes('obrigatorio'))).toBe(true)
    expect(errs.some((e) => e.includes('.caption') && e.includes('obrigatorio'))).toBe(true)
    expect(errs.some((e) => e.includes('.credit') && e.includes('obrigatorio'))).toBe(true)
  })

  it('parses a figure slide in a study manifest', () => {
    const r = parseStudyManifest(
      JSON.stringify({
        course: { course: 'Fisiopatologia' },
        slides: [FIGURE],
      }),
    )
    expect(r.ok).toBe(true)
  })
})
