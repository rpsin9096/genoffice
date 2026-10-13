import { describe, expect, it } from 'vitest'
import { compileSlide } from '../src/slides/study/compile'
import { lintDeck } from '../src/slides/study/lint'
import { parseStudyManifest } from '../src/slides/study/manifest'
import type { StudySlide } from '../src/slides/study/types'

const STAT = {
  module: 'stat_card' as const,
  kicker: 'Magnitude',
  title: 'Janela temporal',
  stat_num: '24 h',
  stat_title: 'Pico de influxo neutrofílico após o estímulo lesivo.',
  narrative_blocks: [
    { title: 'Fase vascular', desc: 'Vasodilatação e permeabilidade nas primeiras horas.' },
    { title: 'Fase celular', desc: 'Neutrófilos dominam o infiltrado nas 24 horas.' },
  ],
  credit: 'Robbins 10ed',
}

const opts = { course: 'Fisiopatologia', index: 6 }

describe('compile stat_card (3.zip m_stat_card)', () => {
  it('emits study_stat_card with the hero metric and narrative', () => {
    const { page } = compileSlide(STAT as StudySlide, opts)
    expect(page.layout).toBe('study_stat_card')
    expect(page.module).toBe('stat_card')
    const blob = JSON.stringify(page)
    expect(blob).toContain('24 h')
    expect(blob).toContain('Pico de influxo neutrofílico')
    expect(blob).toContain('Fase vascular')
    expect(blob).toContain('Fonte / Crédito: Robbins 10ed')
    expect(page.elements.length).toBeGreaterThan(6)
  })

  it('labels a web image instead of fetching it', () => {
    const { page } = compileSlide(
      { ...STAT, image: 'https://cdn.example.org/neutro.png' } as StudySlide,
      opts,
    )
    const blob = JSON.stringify(page)
    expect(blob).toContain('FUENTE WEB')
    expect(page.elements.some((el) => el.type === 'image')).toBe(false)
  })

  it('lints required fields and narrative cardinality', () => {
    expect(lintDeck([STAT as StudySlide])).toEqual([])
    const empty = lintDeck([
      { module: 'stat_card', title: 'X', stat_num: '', stat_title: '' } as StudySlide,
    ])
    expect(empty.some((e) => e.includes('.stat_num') && e.includes('obrigatorio'))).toBe(true)
    expect(empty.some((e) => e.includes('.stat_title') && e.includes('obrigatorio'))).toBe(true)
    expect(empty.some((e) => e.includes('.narrative_blocks') && e.includes('esperado 1-3'))).toBe(
      true,
    )
  })

  it('parses a stat_card slide in a study manifest', () => {
    const r = parseStudyManifest(
      JSON.stringify({ course: { course: 'Fisiopatologia' }, slides: [STAT] }),
    )
    expect(r.ok).toBe(true)
  })
})
