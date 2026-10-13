import { describe, expect, it } from 'vitest'
import { driftHits } from '../src/slides/study/i18n'
import { lintDeck } from '../src/slides/study/lint'
import { INFLAMACAO_MANIFEST } from './fixtures/inflamacao'
import type { StudySlide } from '../src/slides/study/types'

function lint(slides: unknown, lang: 'pt-BR' | 'es-ES' | 'en-US' = 'pt-BR'): string[] {
  return lintDeck(slides as StudySlide[], lang)
}

describe('i18n drift_hits (3.zip)', () => {
  it('flags Spanish calques in pt-BR copy', () => {
    const hits = driftHits('El desarrollo del estudio clínico.', 'pt-BR')
    expect(hits.map((h) => h.word)).toEqual(
      expect.arrayContaining(['el', 'desarrollo', 'del', 'estudio']),
    )
    expect(hits.find((h) => h.word === 'desarrollo')?.fix).toBe('desenvolvimento')
  })

  it('flags Portuguese calques in es-ES copy', () => {
    const hits = driftHits('O desenvolvimento da aprendizagem.', 'es-ES')
    expect(hits.map((h) => h.word)).toEqual(
      expect.arrayContaining(['desenvolvimento', 'aprendizagem']),
    )
  })

  it('respects word boundaries', () => {
    expect(driftHits('desarrollox no bate', 'pt-BR').map((h) => h.word)).not.toContain('desarrollo')
  })

  it('leaves the inflamacao fixture clean', () => {
    expect(lint(INFLAMACAO_MANIFEST.slides)).toEqual([])
  })

  it('wires drift into lintDeck', () => {
    const errs = lint([
      {
        module: 'definition',
        title: 'Conceito',
        main_statement: 'El desarrollo vascular da inflamação aguda.',
      },
    ])
    expect(errs.some((e) => e.includes('drift') && e.includes('desarrollo'))).toBe(true)
    expect(errs.some((e) => e.includes('reescreva em pt-BR'))).toBe(true)
  })

  it('allow_terms exempts a whole string', () => {
    const slide = {
      module: 'definition' as const,
      title: 'Conceito',
      main_statement: 'El desarrollo vascular da inflamação aguda.',
    }
    expect(lintDeck([slide], 'pt-BR').some((e) => e.includes('drift'))).toBe(true)
    expect(lintDeck([slide], 'pt-BR', ['desarrollo']).some((e) => e.includes('drift'))).toBe(false)
  })
})
