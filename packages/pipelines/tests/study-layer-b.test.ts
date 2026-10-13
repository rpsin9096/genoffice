import { describe, expect, it } from 'vitest'
import { layerBVisible } from '../src/slides/study/layer-b'
import { lintDeck } from '../src/slides/study/lint'
import type { StudySlide } from '../src/slides/study/types'

describe('Layer B visible (Fase 3 panel rows)', () => {
  it('turns STYLE_CRUTCH into a panel row with code and loc', () => {
    const errs = lintDeck(
      [
        {
          module: 'definition',
          title: 'X',
          main_statement: 'É importante destacar que a inflamação é vascular.',
          key_points: [
            { title: 'A', desc: 'um ponto' },
            { title: 'B', desc: 'outro ponto' },
          ],
        },
      ] as StudySlide[],
      'pt-BR',
    )
    const rows = layerBVisible(errs)
    const hit = rows.find((r) => r.code === 'STYLE_CRUTCH')
    expect(hit).toBeTruthy()
    expect(hit!.kind).toBe('style')
    expect(hit!.loc).toMatch(/slide 1 \[definition\]/)
    expect(hit!.message).toContain('STYLE_CRUTCH')
  })

  it('classifies estimated overflow as fit', () => {
    const rows = layerBVisible([
      'slide 1 [title].title: transbordo estimado (3.10in > 2.10in) — encurte o texto',
    ])
    expect(rows[0]).toMatchObject({ kind: 'fit', code: 'FIT' })
  })

  it('classifies language drift as i18n', () => {
    const rows = layerBVisible([
      'slide 1 [definition].title: drift "however" -> no entanto (reescreva em pt-BR)',
    ])
    expect(rows[0]).toMatchObject({ kind: 'i18n', code: 'DRIFT' })
  })

  it('returns an empty list when lint is clean', () => {
    expect(layerBVisible([])).toEqual([])
  })
})
