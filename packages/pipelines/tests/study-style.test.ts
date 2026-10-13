import { describe, expect, it } from 'vitest'
import { styleHits } from '../src/slides/study/style'

function codes(text: string, lang: 'pt-BR' | 'es-ES' | 'en-US' = 'pt-BR'): string[] {
  return styleHits(text, lang).map((h) => h.code)
}

describe('Layer B style_hits (3.zip test_style.py)', () => {
  it('blocks Portuguese introductory crutches', () => {
    expect(codes('E importante destacar que a inflamação é vascular.')).toContain('STYLE_CRUTCH')
  })

  it('blocks Spanish crutches', () => {
    expect(codes('Cabe resaltar que la inflamación es vascular.', 'es-ES')).toContain(
      'STYLE_CRUTCH',
    )
  })

  it('blocks English crutches', () => {
    expect(codes('It is important to note that inflammation is vascular.', 'en-US')).toContain(
      'STYLE_CRUTCH',
    )
  })

  it('blocks dramatic metaphor (arsenal / orchestrate)', () => {
    expect(codes('O arsenal terapêutico reduz a mortalidade.')).toContain('STYLE_METAPHOR')
    expect(codes('The pathway orchestrates the immune response.', 'en-US')).toContain(
      'STYLE_METAPHOR',
    )
  })

  it('allows literal clinical collapse with a qualifier', () => {
    expect(styleHits('O colapso hemodinâmico reduz o débito urinário.')).toEqual([])
  })

  it('blocks figurative collapse', () => {
    const hits = styleHits('O colapso do sistema de saúde eleva a mortalidade.')
    expect(hits.some((h) => h.code === 'STYLE_LITERAL' && h.term === 'colapso')).toBe(true)
  })

  it('allows hepatite fulminante and blocks figurative fulminante', () => {
    expect(styleHits('A hepatite fulminante leva a insuficiência hepática em dias.')).toEqual([])
    expect(
      styleHits('A resposta fulminante do sistema imune devasta o tecido.').some(
        (h) => h.code === 'STYLE_LITERAL' && h.term === 'fulminante',
      ),
    ).toBe(true)
  })

  it('blocks vague quantifiers', () => {
    expect(codes('Diversos fatores elevam a pressão arterial.')).toContain('STYLE_VAGUE')
    expect(codes('Various mechanisms elevate blood pressure.', 'en-US')).toContain('STYLE_VAGUE')
  })
})
