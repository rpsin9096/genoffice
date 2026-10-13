import { describe, expect, it } from 'vitest'
import { compileSlide } from '../src/slides/study/compile'
import { lintDeck } from '../src/slides/study/lint'
import { parseStudyManifest } from '../src/slides/study/manifest'
import type { StudySlide } from '../src/slides/study/types'

const LIST = {
  module: 'checklist' as const,
  kicker: 'Protocolo',
  title: 'Sinais cardinais',
  items: [
    { label: 'Rubor', desc: 'Eritema local por vasodilatação arteriolar.', checked: true },
    { label: 'Calor', desc: 'Aumento da temperatura cutânea no foco.', checked: true },
    { label: 'Febre sistêmica', desc: 'Não é sinal cardinal local.', checked: false },
  ],
  credit: 'Celsus',
}

const opts = { course: 'Fisiopatologia', index: 7 }

describe('compile checklist (3.zip m_checklist)', () => {
  it('emits study_checklist with check and cross marks', () => {
    const { page } = compileSlide(LIST as StudySlide, opts)
    expect(page.layout).toBe('study_checklist')
    expect(page.module).toBe('checklist')
    const blob = JSON.stringify(page)
    expect(blob).toContain('Rubor')
    expect(blob).toContain('Febre sistêmica')
    expect(blob).toContain('✓')
    expect(blob).toContain('✕')
    expect(blob).toContain('Fonte / Crédito: Celsus')
  })

  it('labels a web image instead of fetching it', () => {
    const { page } = compileSlide(
      { ...LIST, image: 'https://cdn.example.org/cardinais.png' } as StudySlide,
      opts,
    )
    expect(JSON.stringify(page)).toContain('FUENTE WEB')
    expect(page.elements.some((el) => el.type === 'image')).toBe(false)
  })

  it('lints item cardinality 2-5', () => {
    expect(lintDeck([LIST as StudySlide])).toEqual([])
    const errs = lintDeck([
      {
        module: 'checklist',
        title: 'X',
        items: [{ label: 'Só um', desc: 'falta o segundo' }],
      } as StudySlide,
    ])
    expect(errs.some((e) => e.includes('.items') && e.includes('esperado 2-5'))).toBe(true)
  })

  it('parses a checklist slide in a study manifest', () => {
    const r = parseStudyManifest(
      JSON.stringify({ course: { course: 'Fisiopatologia' }, slides: [LIST] }),
    )
    expect(r.ok).toBe(true)
  })
})
