import { describe, expect, it } from 'vitest'
import { lintDeck } from '../src/slides/study/lint'
import { INFLAMACAO_MANIFEST } from './fixtures/inflamacao'
import type { StudySlide } from '../src/slides/study/types'

function lint(slides: unknown): string[] {
  return lintDeck(slides as StudySlide[], 'pt-BR')
}

describe('study contract lint (3.zip B + REQUIRED)', () => {
  it('accepts the inflamacao fixture', () => {
    expect(lint(INFLAMACAO_MANIFEST.slides)).toEqual([])
  })

  it('rejects an empty required field', () => {
    const errs = lint([{ module: 'title', title: '   ' }])
    expect(errs.some((e) => e.includes('obrigatorio') && e.includes('.title'))).toBe(true)
  })

  it('rejects a string over the B character budget', () => {
    const errs = lint([{ module: 'title', title: 'T'.repeat(81) }])
    expect(errs.some((e) => e.includes('81 > 80') && e.includes('.title'))).toBe(true)
  })

  it('rejects list cardinality outside the module window', () => {
    const errs = lint([
      {
        module: 'glossary',
        title: 'Glossário',
        terms: [
          { term: 'A', def: 'um' },
          { term: 'B', def: 'dois' },
        ],
      },
    ])
    expect(errs.some((e) => e.includes('.terms') && e.includes('esperado 4-10'))).toBe(true)
  })

  it('rejects a comparison_table with too few rows', () => {
    const errs = lint([
      {
        module: 'comparison_table',
        title: 'Tabela',
        headers: ['A', 'B', 'C'],
        rows: [
          ['1', '2', '3'],
          ['4', '5', '6'],
        ],
      },
    ])
    expect(errs.some((e) => e.includes('.rows') && e.includes('esperado 3-4'))).toBe(true)
  })

  it('rejects a flow_diagram without exactly one highlight', () => {
    const errs = lint([
      {
        module: 'flow_diagram',
        title: 'Fluxo',
        steps: [
          { title: 'Um', desc: 'primeiro passo do fluxo' },
          { title: 'Dois', desc: 'segundo passo do fluxo' },
          { title: 'Tres', desc: 'terceiro passo do fluxo' },
        ],
      },
    ])
    expect(errs.some((e) => e.includes('destacados') && e.includes('esperado 1-1'))).toBe(true)
  })

  it('rejects an unsubstituted scaffold marker', () => {
    const errs = lint([{ module: 'title', title: '<= 80 car. >' }])
    expect(errs.some((e) => e.includes('marcador') && e.includes('<= 80 car. >'))).toBe(true)
  })
})
