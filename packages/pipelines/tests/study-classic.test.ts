import { describe, expect, it } from 'vitest'
import { compileSlide } from '../src/slides/study/compile'
import { lintDeck } from '../src/slides/study/lint'
import { parseStudyManifest } from '../src/slides/study/manifest'
import type { StudySlide } from '../src/slides/study/types'

const opts = { course: 'Fisiopatologia', index: 8 }

const ALGORITHM = {
  module: 'algorithm' as const,
  title: 'Conduta inicial',
  steps: [
    {
      label: '01',
      title: 'Reconhecer sinais cardinais',
      desc: 'Rubor, calor, dor e tumor locais.',
    },
    {
      label: '02',
      title: 'Separar infecção de esteril',
      desc: 'Febre e secreção sugerem agente vivo.',
      highlight: true,
    },
    {
      label: '03',
      title: 'Definir drenagem ou observação',
      desc: 'Abscesso localizado pede drenagem.',
    },
  ],
}

const SCHEMA = {
  module: 'fixed_schema_card' as const,
  title: 'Ficha operacional',
  fields: [
    { label: 'Célula', value: 'Neutrófilo nas primeiras 24 horas.' },
    { label: 'Mediador', value: 'Histamina e prostaglandinas na fase vascular.' },
  ],
}

const SIDE = {
  module: 'side_by_side' as const,
  title: 'Aguda versus crônica',
  left_card: {
    header: 'Aguda',
    title: 'Horas a dias',
    points: ['Neutrófilos no foco', 'Exsudato proteico', 'Resolução ou abscesso'],
  },
  right_card: {
    header: 'Crônica',
    title: 'Semanas a anos',
    points: ['Linfócitos e macrófagos', 'Fibrose do tecido', 'Destruição persistente'],
  },
}

const TAXONOMY = {
  module: 'taxonomy_tree' as const,
  title: 'Classificação',
  root: 'Inflamação',
  categories: [
    {
      name: 'Aguda',
      property: 'Início rápido',
      examples: ['Queimadura', 'Corte', 'Infecção piogênica'],
    },
    {
      name: 'Crônica',
      property: 'Persistência',
      examples: ['Granuloma', 'Autoimune'],
    },
  ],
}

const GRID = {
  module: 'synthesis_grid' as const,
  title: 'Matriz-resumo',
  headers: ['Eixo', 'Aguda', 'Crônica'],
  matrix_data: [
    ['Células', 'Neutrófilos', 'Macrófagos'],
    ['Tempo', 'Horas a dias', 'Semanas'],
    ['Desfecho', 'Resolução', 'Fibrose'],
  ],
}

describe('classic module batch (3.zip)', () => {
  it('compiles algorithm with a highlighted step', () => {
    const { page } = compileSlide(ALGORITHM as StudySlide, opts)
    expect(page.layout).toBe('study_algorithm')
    const blob = JSON.stringify(page)
    expect(blob).toContain('Reconhecer sinais cardinais')
    expect(blob).toContain('01')
  })

  it('compiles fixed_schema_card label/value rows', () => {
    const { page } = compileSlide(SCHEMA as StudySlide, opts)
    expect(page.layout).toBe('study_fixed_schema_card')
    expect(JSON.stringify(page)).toContain('CÉLULA')
    expect(JSON.stringify(page)).toContain('Histamina')
  })

  it('compiles side_by_side dichotomous cards', () => {
    const { page } = compileSlide(SIDE as StudySlide, opts)
    expect(page.layout).toBe('study_side_by_side')
    const blob = JSON.stringify(page)
    expect(blob).toContain('Horas a dias')
    expect(blob).toContain('Fibrose do tecido')
  })

  it('compiles taxonomy_tree with root and categories', () => {
    const { page } = compileSlide(TAXONOMY as StudySlide, opts)
    expect(page.layout).toBe('study_taxonomy_tree')
    const blob = JSON.stringify(page)
    expect(blob).toContain('INFLAMAÇÃO')
    expect(blob).toContain('Granuloma')
  })

  it('compiles synthesis_grid from matrix_data', () => {
    const { page } = compileSlide(GRID as StudySlide, opts)
    expect(page.layout).toBe('study_synthesis_grid')
    expect(JSON.stringify(page)).toContain('Macrófagos')
  })

  it('lints cardinality for the five modules', () => {
    expect(lintDeck([ALGORITHM, SCHEMA, SIDE, TAXONOMY, GRID] as StudySlide[])).toEqual([])
    expect(
      lintDeck([
        { module: 'algorithm', title: 'X', steps: [{ title: 'só um' }] } as StudySlide,
      ]).some((e) => e.includes('.steps') && e.includes('esperado 2-4')),
    ).toBe(true)
    expect(
      lintDeck([
        {
          module: 'fixed_schema_card',
          title: 'X',
          fields: [{ label: 'A', value: 'b' }],
        } as StudySlide,
      ]).some((e) => e.includes('.fields') && e.includes('esperado 2-5')),
    ).toBe(true)
  })

  it('parses all five in a study manifest', () => {
    const r = parseStudyManifest(
      JSON.stringify({
        course: { course: 'Fisiopatologia' },
        slides: [ALGORITHM, SCHEMA, SIDE, TAXONOMY, GRID],
      }),
    )
    expect(r.ok).toBe(true)
  })
})
