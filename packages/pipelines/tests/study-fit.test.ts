import { describe, expect, it } from 'vitest'
import { lintDeck } from '../src/slides/study/lint'
import { INFLAMACAO_MANIFEST } from './fixtures/inflamacao'
import type { StudySlide } from '../src/slides/study/types'

function lint(slides: unknown): string[] {
  return lintDeck(slides as StudySlide[], 'pt-BR')
}

describe('study fit lint (3.zip FIT_TOLERANCE 1.06)', () => {
  it('accepts the inflamacao fixture', () => {
    expect(lint(INFLAMACAO_MANIFEST.slides)).toEqual([])
  })

  it('rejects a title whose estimated height overflows the box', () => {
    const errs = lint([
      { module: 'title', title: Array.from({ length: 12 }, () => 'Hi').join('\n') },
    ])
    expect(errs.some((e) => e.includes('.title') && e.includes('transbordo estimado'))).toBe(true)
  })

  it('rejects a definition main_statement that stacks past 0.95in', () => {
    const errs = lint([
      {
        module: 'definition',
        title: 'Definição',
        main_statement: Array.from({ length: 20 }, () => 'x').join('\n'),
        key_points: [
          { title: 'A', desc: 'um' },
          { title: 'B', desc: 'dois' },
        ],
      },
    ])
    expect(
      errs.some((e) => e.includes('.main_statement') && e.includes('transbordo estimado')),
    ).toBe(true)
  })

  it('names the estimated inches in the error', () => {
    const errs = lint([
      { module: 'title', title: Array.from({ length: 12 }, () => 'Hi').join('\n') },
    ])
    const hit = errs.find((e) => e.includes('transbordo estimado'))
    expect(hit).toMatch(/\d+\.\d{2}in > 2\.10in/)
  })
})
