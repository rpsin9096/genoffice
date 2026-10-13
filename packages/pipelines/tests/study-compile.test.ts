import { describe, expect, it } from 'vitest'
import { COMPACT, STANDARD, inToPx } from '../src/slides/study/geometry'
import { contrastRatio, requiredRatio } from '../src/slides/study/contrast'
import { UCP } from '../src/slides/study/palette-ucp'
import { compileDefinition, type DefinitionSlide } from '../src/slides/study/compile'

/** Slide 4 of examples/ejemplo_inflamacao.py in study-deck 3.zip */
const INFLAMACAO: DefinitionSlide = {
  module: 'definition',
  kicker: 'Conceito',
  title: 'Definição operacional',
  main_statement:
    'A inflamação aguda é a resposta vascular estereotipada do tecido vivo diante da lesão, orientada a neutralizar o agente e reparar o dano.',
  key_points: [
    {
      title: 'Fase vascular',
      desc: 'Vasodilatação e aumento da permeabilidade produzem rubor, calor e edema.',
    },
    {
      title: 'Fase celular',
      desc: 'Neutrófilos chegam primeiro; monocitos conduzem a fase de reparo.',
    },
  ],
}

const DENSE = 'x'.repeat(190)

function boxes(page: { elements: { x: number; y: number; w: number; h: number }[] }) {
  return page.elements
}

describe('compileDefinition (Fase 0)', () => {
  it('echoes study_definition and a named tier — the LLM never places x', () => {
    const { page, tier } = compileDefinition(INFLAMACAO, { course: 'Fisiopatologia', index: 4 })
    expect(page.layout).toBe('study_definition')
    expect(page.module).toBe('definition')
    expect(page.title).toBe(INFLAMACAO.title)
    expect(tier).toBe(STANDARD)
    expect(page.tier).toBe('STANDARD')
    expect(page.background).toBe(`#${UCP.bg}`)
    expect(page.elements.length).toBeGreaterThan(4)
  })

  it('keeps every element on the 1280x720 canvas', () => {
    const { page } = compileDefinition(INFLAMACAO, { course: 'Fisiopatologia', index: 4 })
    for (const el of boxes(page)) {
      expect(el.x).toBeGreaterThanOrEqual(0)
      expect(el.y).toBeGreaterThanOrEqual(0)
      expect(el.x + el.w).toBeLessThanOrEqual(1280)
      expect(el.y + el.h).toBeLessThanOrEqual(720)
      expect(el.w).toBeGreaterThan(0)
      expect(el.h).toBeGreaterThan(0)
    }
  })

  it('paints the inflamação copy into the page-spec', () => {
    const { page } = compileDefinition(INFLAMACAO, { course: 'Fisiopatologia', index: 4 })
    const blob = JSON.stringify(page)
    expect(blob).toContain(INFLAMACAO.main_statement)
    expect(blob).toContain('Fase vascular')
    expect(blob).toContain('Fase celular')
    expect(blob).toContain('CONCEITO')
    expect(blob).toContain('04')
  })

  it('chooses COMPACT for the 3.zip DENSE key-point case', () => {
    const dense: DefinitionSlide = {
      module: 'definition',
      kicker: 'Carga',
      title: 'Definicao densa',
      main_statement: 'Resposta vascular estereotipada do tecido vivo diante da lesao.',
      key_points: [
        { title: 'Um', desc: DENSE },
        { title: 'Dois', desc: DENSE },
        { title: 'Tres', desc: DENSE },
      ],
    }
    const { tier, page } = compileDefinition(dense, { course: 'Fisiopatologia', index: 2 })
    expect(tier).toBe(COMPACT)
    expect(page.tier).toBe('COMPACT')
  })

  it('records WCAG-AA text/fill pairs for every run the compiler paints', () => {
    const { pairs } = compileDefinition(INFLAMACAO, { course: 'Fisiopatologia', index: 4 })
    expect(pairs.length).toBeGreaterThan(0)
    for (const p of pairs) {
      expect(contrastRatio(p.fg, p.bg)).toBeGreaterThanOrEqual(requiredRatio(p.sizePt, p.bold))
    }
  })

  it('uses inch geometry converted at 96 dpi (safe origin is 0.65in)', () => {
    const { page } = compileDefinition(INFLAMACAO, { course: 'Fisiopatologia', index: 4 })
    const xs = page.elements.map((el) => el.x)
    expect(xs).toContain(inToPx(0.65))
  })
})
