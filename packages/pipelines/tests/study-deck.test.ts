import { describe, expect, it } from 'vitest'
import { compileDeck } from '../src/slides/study/compile'
import { lintDeck } from '../src/slides/study/lint'
import { contrastRatio, requiredRatio } from '../src/slides/study/contrast'
import { INFLAMACAO_MANIFEST } from './fixtures/inflamacao'

describe('compileDeck inflamacao (10 slides from 3.zip)', () => {
  it('emits one study_* page per module in order', () => {
    const pages = compileDeck(INFLAMACAO_MANIFEST)
    expect(pages).toHaveLength(10)
    expect(pages.map((p) => p.page.module)).toEqual([
      'title',
      'learning_objectives',
      'section_divider',
      'definition',
      'timeline',
      'comparison_table',
      'flow_diagram',
      'case_block',
      'glossary',
      'further_reading',
    ])
    expect(pages.map((p) => p.page.layout)).toEqual(pages.map((p) => `study_${p.page.module}`))
  })

  it('keeps every element on the 1280x720 canvas', () => {
    for (const { page } of compileDeck(INFLAMACAO_MANIFEST)) {
      for (const el of page.elements) {
        expect(el.x).toBeGreaterThanOrEqual(0)
        expect(el.y).toBeGreaterThanOrEqual(0)
        expect(el.x + el.w).toBeLessThanOrEqual(1280)
        expect(el.y + el.h).toBeLessThanOrEqual(720)
      }
    }
  })

  it('paints the source copy into each page', () => {
    const blob = JSON.stringify(compileDeck(INFLAMACAO_MANIFEST).map((p) => p.page))
    expect(blob).toContain('Fisiopatologia da inflamação aguda')
    expect(blob).toContain('OBJETIVOS DE APRENDIZAGEM')
    expect(blob).toContain('A resposta inflamatória')
    expect(blob).toContain('Definição operacional')
    expect(blob).toContain('Fases temporais')
    expect(blob).toContain('Aguda versus crônica')
    expect(blob).toContain('Histamina')
    expect(blob).toContain('VINHETA CLÍNICA')
    expect(blob).toContain('DIAPEDESE')
    expect(blob).toContain('Robbins: capítulo de inflamação aguda')
  })

  it('records WCAG-AA pairs on every painted run', () => {
    for (const { pairs } of compileDeck(INFLAMACAO_MANIFEST)) {
      expect(pairs.length).toBeGreaterThan(0)
      for (const p of pairs) {
        expect(contrastRatio(p.fg, p.bg)).toBeGreaterThanOrEqual(requiredRatio(p.sizePt, p.bold))
      }
    }
  })

  it('lints the inflamacao manifest clean and rejects a crutch', () => {
    expect(lintDeck(INFLAMACAO_MANIFEST.slides, 'pt-BR')).toEqual([])
    const dirty: Parameters<typeof lintDeck>[0] = [
      {
        module: 'definition',
        title: 'X',
        main_statement: 'É importante destacar que a inflamação é vascular.',
      },
    ]
    expect(lintDeck(dirty, 'pt-BR').some((e) => e.includes('STYLE_CRUTCH'))).toBe(true)
  })
})
